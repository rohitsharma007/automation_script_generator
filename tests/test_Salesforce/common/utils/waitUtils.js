/**
 * Intelligent Wait Utilities
 * Provides smart waiting strategies for various scenarios in web automation
 */

const Logger = require('./logger');

class WaitUtils {
    constructor(page, options = {}) {
        this.page = page;
        this.options = {
            defaultTimeout: options.defaultTimeout || 30000,
            shortTimeout: options.shortTimeout || 5000,
            longTimeout: options.longTimeout || 60000,
            pollInterval: options.pollInterval || 100,
            retryAttempts: options.retryAttempts || 3,
            logLevel: options.logLevel || 'info',
            ...options
        };

        this.logger = new Logger({ level: this.options.logLevel });
        this.waitStrategies = new Map();
        this.performanceMetrics = new Map();
        
        this.initializeWaitStrategies();
    }

    /**
     * Smart wait for element with multiple fallback strategies
     */
    async waitForElement(selector, options = {}) {
        const config = {
            timeout: options.timeout || this.options.defaultTimeout,
            visible: options.visible !== false,
            stable: options.stable !== false,
            retries: options.retries || this.options.retryAttempts,
            strategy: options.strategy || 'auto',
            ...options
        };

        this.logger.debug('Waiting for element', { selector, config });
        const startTime = Date.now();

        try {
            let element = null;
            
            // Try different strategies based on configuration
            switch (config.strategy) {
                case 'auto':
                    element = await this.autoWaitStrategy(selector, config);
                    break;
                case 'aggressive':
                    element = await this.aggressiveWaitStrategy(selector, config);
                    break;
                case 'patient':
                    element = await this.patientWaitStrategy(selector, config);
                    break;
                case 'smart':
                    element = await this.smartWaitStrategy(selector, config);
                    break;
                default:
                    element = await this.defaultWaitStrategy(selector, config);
            }

            const duration = Date.now() - startTime;
            this.recordPerformanceMetric('waitForElement', duration, true);
            this.logger.debug('Element found', { selector, duration });
            
            return element;
        } catch (error) {
            const duration = Date.now() - startTime;
            this.recordPerformanceMetric('waitForElement', duration, false);
            this.logger.warn('Element wait failed', { selector, duration, error: error.message });
            throw error;
        }
    }

    /**
     * Auto wait strategy - intelligently chooses the best approach
     */
    async autoWaitStrategy(selector, config) {
        // Analyze selector to determine best strategy
        const selectorType = this.analyzeSelectorType(selector);
        
        switch (selectorType) {
            case 'dynamic':
                return await this.smartWaitStrategy(selector, config);
            case 'static':
                return await this.defaultWaitStrategy(selector, config);
            case 'complex':
                return await this.patientWaitStrategy(selector, config);
            default:
                return await this.defaultWaitStrategy(selector, config);
        }
    }

    /**
     * Aggressive wait strategy - shorter timeouts, more frequent polling
     */
    async aggressiveWaitStrategy(selector, config) {
        const aggressiveConfig = {
            ...config,
            timeout: Math.min(config.timeout, this.options.shortTimeout),
            pollInterval: 50
        };

        return await this.page.waitForSelector(selector, {
            timeout: aggressiveConfig.timeout,
            visible: aggressiveConfig.visible
        });
    }

    /**
     * Patient wait strategy - longer timeouts, less frequent polling
     */
    async patientWaitStrategy(selector, config) {
        const patientConfig = {
            ...config,
            timeout: Math.max(config.timeout, this.options.longTimeout),
            pollInterval: 500
        };

        // Wait with multiple conditions
        return await this.page.waitForFunction(
            (sel, visible) => {
                const element = document.querySelector(sel);
                if (!element) return false;
                if (visible && !element.offsetParent) return false;
                return true;
            },
            [selector, config.visible],
            { timeout: patientConfig.timeout, polling: patientConfig.pollInterval }
        );
    }

    /**
     * Smart wait strategy - adaptive based on page behavior
     */
    async smartWaitStrategy(selector, config) {
        // First, wait for network to be idle
        await this.waitForNetworkIdle({ timeout: 5000 }).catch(() => {});
        
        // Then wait for element with stability check
        const element = await this.page.waitForSelector(selector, {
            timeout: config.timeout,
            visible: config.visible
        });

        // Ensure element is stable (not moving/changing)
        if (config.stable) {
            await this.waitForElementStability(selector, { timeout: 2000 });
        }

        return element;
    }

    /**
     * Default wait strategy
     */
    async defaultWaitStrategy(selector, config) {
        return await this.page.waitForSelector(selector, {
            timeout: config.timeout,
            visible: config.visible
        });
    }

    /**
     * Wait for multiple elements with different strategies
     */
    async waitForElements(selectors, options = {}) {
        const config = {
            strategy: options.strategy || 'parallel',
            timeout: options.timeout || this.options.defaultTimeout,
            requireAll: options.requireAll !== false,
            ...options
        };

        this.logger.debug('Waiting for multiple elements', { selectors, config });

        try {
            let results = [];
            
            switch (config.strategy) {
                case 'parallel':
                    results = await this.waitForElementsParallel(selectors, config);
                    break;
                case 'sequential':
                    results = await this.waitForElementsSequential(selectors, config);
                    break;
                case 'race':
                    results = await this.waitForElementsRace(selectors, config);
                    break;
                default:
                    results = await this.waitForElementsParallel(selectors, config);
            }

            return results;
        } catch (error) {
            this.logger.warn('Multiple elements wait failed', { selectors, error: error.message });
            throw error;
        }
    }

    /**
     * Wait for elements in parallel
     */
    async waitForElementsParallel(selectors, config) {
        const promises = selectors.map(selector => 
            this.waitForElement(selector, config).catch(error => ({ error, selector }))
        );

        const results = await Promise.all(promises);
        
        if (config.requireAll) {
            const failures = results.filter(result => result.error);
            if (failures.length > 0) {
                throw new Error(`Failed to find elements: ${failures.map(f => f.selector).join(', ')}`);
            }
        }

        return results;
    }

    /**
     * Wait for elements sequentially
     */
    async waitForElementsSequential(selectors, config) {
        const results = [];
        
        for (const selector of selectors) {
            try {
                const element = await this.waitForElement(selector, config);
                results.push(element);
            } catch (error) {
                if (config.requireAll) {
                    throw error;
                }
                results.push({ error, selector });
            }
        }

        return results;
    }

    /**
     * Wait for any element to appear (race condition)
     */
    async waitForElementsRace(selectors, config) {
        const promises = selectors.map((selector, index) => 
            this.waitForElement(selector, config).then(element => ({ element, selector, index }))
        );

        return await Promise.race(promises);
    }

    /**
     * Wait for network to be idle
     */
    async waitForNetworkIdle(options = {}) {
        const config = {
            timeout: options.timeout || this.options.defaultTimeout,
            idleTime: options.idleTime || 500,
            maxInflightRequests: options.maxInflightRequests || 0,
            ...options
        };

        this.logger.debug('Waiting for network idle', config);

        try {
            await this.page.waitForLoadState('networkidle', { timeout: config.timeout });
            this.logger.debug('Network is idle');
        } catch (error) {
            this.logger.warn('Network idle wait failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Wait for page to be fully loaded
     */
    async waitForPageLoad(options = {}) {
        const config = {
            timeout: options.timeout || this.options.longTimeout,
            waitForImages: options.waitForImages !== false,
            waitForFonts: options.waitForFonts !== false,
            waitForScripts: options.waitForScripts !== false,
            ...options
        };

        this.logger.debug('Waiting for page load', config);

        try {
            // Wait for basic load states
            await this.page.waitForLoadState('load', { timeout: config.timeout });
            await this.page.waitForLoadState('domcontentloaded', { timeout: config.timeout });
            
            // Wait for network idle
            await this.waitForNetworkIdle({ timeout: 5000 }).catch(() => {});

            // Wait for specific resources if requested
            if (config.waitForImages) {
                await this.waitForImages({ timeout: 10000 }).catch(() => {});
            }

            if (config.waitForFonts) {
                await this.waitForFonts({ timeout: 5000 }).catch(() => {});
            }

            this.logger.debug('Page fully loaded');
        } catch (error) {
            this.logger.warn('Page load wait failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Wait for images to load
     */
    async waitForImages(options = {}) {
        const timeout = options.timeout || 10000;
        
        await this.page.waitForFunction(
            () => {
                const images = Array.from(document.images);
                return images.every(img => img.complete && img.naturalHeight !== 0);
            },
            [],
            { timeout }
        );
    }

    /**
     * Wait for fonts to load
     */
    async waitForFonts(options = {}) {
        const timeout = options.timeout || 5000;
        
        await this.page.waitForFunction(
            () => document.fonts && document.fonts.ready,
            [],
            { timeout }
        );
    }

    /**
     * Wait for element to be stable (not moving/changing)
     */
    async waitForElementStability(selector, options = {}) {
        const config = {
            timeout: options.timeout || 5000,
            stabilityTime: options.stabilityTime || 1000,
            tolerance: options.tolerance || 1,
            ...options
        };

        this.logger.debug('Waiting for element stability', { selector, config });

        const startTime = Date.now();
        let lastPosition = null;
        let stableStartTime = null;

        while (Date.now() - startTime < config.timeout) {
            try {
                const element = await this.page.$(selector);
                if (!element) {
                    throw new Error(`Element not found: ${selector}`);
                }

                const boundingBox = await element.boundingBox();
                if (!boundingBox) {
                    await this.page.waitForTimeout(100);
                    continue;
                }

                const currentPosition = {
                    x: Math.round(boundingBox.x),
                    y: Math.round(boundingBox.y),
                    width: Math.round(boundingBox.width),
                    height: Math.round(boundingBox.height)
                };

                if (lastPosition) {
                    const isStable = 
                        Math.abs(currentPosition.x - lastPosition.x) <= config.tolerance &&
                        Math.abs(currentPosition.y - lastPosition.y) <= config.tolerance &&
                        Math.abs(currentPosition.width - lastPosition.width) <= config.tolerance &&
                        Math.abs(currentPosition.height - lastPosition.height) <= config.tolerance;

                    if (isStable) {
                        if (!stableStartTime) {
                            stableStartTime = Date.now();
                        } else if (Date.now() - stableStartTime >= config.stabilityTime) {
                            this.logger.debug('Element is stable', { selector });
                            return true;
                        }
                    } else {
                        stableStartTime = null;
                    }
                }

                lastPosition = currentPosition;
                await this.page.waitForTimeout(100);
            } catch (error) {
                this.logger.warn('Stability check failed', { selector, error: error.message });
                await this.page.waitForTimeout(100);
            }
        }

        throw new Error(`Element did not stabilize within ${config.timeout}ms: ${selector}`);
    }

    /**
     * Wait for condition with custom function
     */
    async waitForCondition(conditionFn, options = {}) {
        const config = {
            timeout: options.timeout || this.options.defaultTimeout,
            pollInterval: options.pollInterval || this.options.pollInterval,
            message: options.message || 'Condition not met',
            ...options
        };

        this.logger.debug('Waiting for custom condition', { message: config.message });

        const startTime = Date.now();
        
        while (Date.now() - startTime < config.timeout) {
            try {
                const result = await conditionFn();
                if (result) {
                    this.logger.debug('Condition met', { message: config.message });
                    return result;
                }
            } catch (error) {
                this.logger.debug('Condition check failed', { error: error.message });
            }
            
            await this.page.waitForTimeout(config.pollInterval);
        }

        throw new Error(`${config.message} (timeout: ${config.timeout}ms)`);
    }

    /**
     * Wait for text to appear
     */
    async waitForText(text, options = {}) {
        const config = {
            timeout: options.timeout || this.options.defaultTimeout,
            exact: options.exact !== false,
            selector: options.selector || 'body',
            ...options
        };

        this.logger.debug('Waiting for text', { text, config });

        const textCondition = config.exact 
            ? `text() = "${text}"`
            : `contains(text(), "${text}")`;

        const xpath = `//*[${textCondition}]`;
        
        try {
            await this.page.waitForSelector(`xpath=${xpath}`, { timeout: config.timeout });
            this.logger.debug('Text found', { text });
        } catch (error) {
            this.logger.warn('Text wait failed', { text, error: error.message });
            throw error;
        }
    }

    /**
     * Wait for URL to match pattern
     */
    async waitForURL(urlPattern, options = {}) {
        const config = {
            timeout: options.timeout || this.options.defaultTimeout,
            exact: options.exact !== false,
            ...options
        };

        this.logger.debug('Waiting for URL', { urlPattern, config });

        try {
            await this.page.waitForURL(urlPattern, { timeout: config.timeout });
            this.logger.debug('URL matched', { urlPattern, currentURL: this.page.url() });
        } catch (error) {
            this.logger.warn('URL wait failed', { urlPattern, currentURL: this.page.url(), error: error.message });
            throw error;
        }
    }

    /**
     * Smart retry mechanism with exponential backoff
     */
    async retry(operation, options = {}) {
        const config = {
            maxAttempts: options.maxAttempts || this.options.retryAttempts,
            baseDelay: options.baseDelay || 1000,
            maxDelay: options.maxDelay || 10000,
            backoffFactor: options.backoffFactor || 2,
            retryCondition: options.retryCondition || (() => true),
            ...options
        };

        this.logger.debug('Starting retry operation', { maxAttempts: config.maxAttempts });

        let lastError;
        
        for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
            try {
                const result = await operation(attempt);
                this.logger.debug('Operation succeeded', { attempt });
                return result;
            } catch (error) {
                lastError = error;
                this.logger.debug('Operation failed', { attempt, error: error.message });
                
                if (attempt === config.maxAttempts || !config.retryCondition(error)) {
                    break;
                }
                
                const delay = Math.min(
                    config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
                    config.maxDelay
                );
                
                this.logger.debug('Retrying after delay', { attempt, delay });
                await this.page.waitForTimeout(delay);
            }
        }

        this.logger.warn('All retry attempts failed', { maxAttempts: config.maxAttempts });
        throw lastError;
    }

    /**
     * Analyze selector type to determine optimal wait strategy
     */
    analyzeSelectorType(selector) {
        // Dynamic selectors (likely to change)
        if (selector.includes('[data-testid]') || selector.includes('[data-cy]')) {
            return 'static';
        }
        
        // Complex selectors
        if (selector.includes('>>') || selector.includes(':has') || selector.split(' ').length > 3) {
            return 'complex';
        }
        
        // Dynamic content indicators
        if (selector.includes('loading') || selector.includes('spinner') || selector.includes('dynamic')) {
            return 'dynamic';
        }
        
        return 'static';
    }

    /**
     * Initialize wait strategies
     */
    initializeWaitStrategies() {
        this.waitStrategies.set('form_submission', {
            preWait: () => this.waitForNetworkIdle({ timeout: 2000 }),
            postWait: () => this.waitForNetworkIdle({ timeout: 5000 })
        });
        
        this.waitStrategies.set('navigation', {
            preWait: () => Promise.resolve(),
            postWait: () => this.waitForPageLoad()
        });
        
        this.waitStrategies.set('ajax_content', {
            preWait: () => this.waitForNetworkIdle({ timeout: 1000 }),
            postWait: () => this.waitForNetworkIdle({ timeout: 3000 })
        });
    }

    /**
     * Execute wait strategy by name
     */
    async executeWaitStrategy(strategyName, phase = 'postWait') {
        const strategy = this.waitStrategies.get(strategyName);
        if (!strategy) {
            this.logger.warn('Unknown wait strategy', { strategyName });
            return;
        }
        
        try {
            await strategy[phase]();
            this.logger.debug('Wait strategy executed', { strategyName, phase });
        } catch (error) {
            this.logger.warn('Wait strategy failed', { strategyName, phase, error: error.message });
        }
    }

    /**
     * Record performance metrics
     */
    recordPerformanceMetric(operation, duration, success) {
        if (!this.performanceMetrics.has(operation)) {
            this.performanceMetrics.set(operation, {
                totalCalls: 0,
                successfulCalls: 0,
                totalDuration: 0,
                averageDuration: 0,
                minDuration: Infinity,
                maxDuration: 0
            });
        }
        
        const metrics = this.performanceMetrics.get(operation);
        metrics.totalCalls++;
        if (success) metrics.successfulCalls++;
        metrics.totalDuration += duration;
        metrics.averageDuration = metrics.totalDuration / metrics.totalCalls;
        metrics.minDuration = Math.min(metrics.minDuration, duration);
        metrics.maxDuration = Math.max(metrics.maxDuration, duration);
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        const stats = {};
        for (const [operation, metrics] of this.performanceMetrics) {
            stats[operation] = {
                ...metrics,
                successRate: metrics.totalCalls > 0 ? (metrics.successfulCalls / metrics.totalCalls) * 100 : 0
            };
        }
        return stats;
    }

    /**
     * Reset performance metrics
     */
    resetPerformanceStats() {
        this.performanceMetrics.clear();
        this.logger.debug('Performance stats reset');
    }

    /**
     * Get optimal timeout for selector
     */
    getOptimalTimeout(selector, operation = 'default') {
        const selectorType = this.analyzeSelectorType(selector);
        const baseTimeout = this.options.defaultTimeout;
        
        const multipliers = {
            static: 1,
            dynamic: 1.5,
            complex: 2
        };
        
        const operationMultipliers = {
            navigation: 2,
            form_submission: 1.5,
            ajax_content: 1.2,
            default: 1
        };
        
        return baseTimeout * 
               (multipliers[selectorType] || 1) * 
               (operationMultipliers[operation] || 1);
    }
}

module.exports = WaitUtils;