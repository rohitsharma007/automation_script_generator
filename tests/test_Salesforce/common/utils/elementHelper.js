/**
 * Advanced Element Helper for Intelligent Element Detection and Interaction
 * Provides robust element finding, interaction, and validation strategies
 */

class ElementHelper {
    constructor(page) {
        this.page = page;
        this.elementCache = new Map();
        this.interactionHistory = [];
        this.retryConfig = {
            maxRetries: 3,
            retryDelay: 1000,
            timeoutMs: 30000
        };
    }

    /**
     * Smart element finder with multiple fallback strategies
     */
    async findElement(selectors, options = {}) {
        const { timeout = this.retryConfig.timeoutMs, visible = true, enabled = true } = options;
        
        // Normalize selectors to array
        const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
        
        for (const selector of selectorArray) {
            try {
                const element = await this.page.waitForSelector(selector, { 
                    timeout: timeout / selectorArray.length,
                    visible,
                    state: enabled ? 'attached' : 'detached'
                });
                
                if (element) {
                    this.cacheElement(selector, element);
                    return { element, selector, strategy: 'direct' };
                }
            } catch (error) {
                console.warn(`Selector failed: ${selector}`, error.message);
            }
        }

        // Fallback to intelligent element discovery
        return await this.intelligentElementFind(selectorArray[0], options);
    }

    /**
     * Intelligent element discovery using multiple strategies
     */
    async intelligentElementFind(primarySelector, options = {}) {
        const strategies = [
            () => this.findByText(primarySelector, options),
            () => this.findByAttributes(primarySelector, options),
            () => this.findByPosition(primarySelector, options),
            () => this.findByContext(primarySelector, options),
            () => this.findBySimilarity(primarySelector, options)
        ];

        for (const strategy of strategies) {
            try {
                const result = await strategy();
                if (result) {
                    return result;
                }
            } catch (error) {
                console.warn('Strategy failed:', error.message);
            }
        }

        throw new Error(`Element not found with any strategy: ${primarySelector}`);
    }

    /**
     * Find element by text content
     */
    async findByText(selector, options = {}) {
        const textPatterns = this.extractTextPatterns(selector);
        
        for (const pattern of textPatterns) {
            try {
                const element = await this.page.locator(`text=${pattern}`).first();
                if (await element.isVisible()) {
                    return { element, selector: `text=${pattern}`, strategy: 'text' };
                }
            } catch (error) {
                continue;
            }
        }
        return null;
    }

    /**
     * Find element by attributes
     */
    async findByAttributes(selector, options = {}) {
        const attributes = this.extractAttributes(selector);
        
        for (const attr of attributes) {
            try {
                const element = await this.page.locator(`[${attr.name}*="${attr.value}"]`).first();
                if (await element.isVisible()) {
                    return { element, selector: `[${attr.name}*="${attr.value}"]`, strategy: 'attribute' };
                }
            } catch (error) {
                continue;
            }
        }
        return null;
    }

    /**
     * Find element by position/layout context
     */
    async findByPosition(selector, options = {}) {
        try {
            // Find elements in common UI positions
            const positionSelectors = [
                'header button', 'nav button', '.header button',
                'footer button', '.footer button',
                'form button', '.form button',
                '.modal button', '[role="dialog"] button'
            ];

            for (const posSelector of positionSelectors) {
                const element = await this.page.locator(posSelector).first();
                if (await element.isVisible()) {
                    return { element, selector: posSelector, strategy: 'position' };
                }
            }
        } catch (error) {
            console.warn('Position-based search failed:', error.message);
        }
        return null;
    }

    /**
     * Find element by semantic context
     */
    async findByContext(selector, options = {}) {
        const contextMap = {
            'login': ['[data-testid*="login"]', '[id*="login"]', '[class*="login"]'],
            'submit': ['[type="submit"]', '[role="button"]', 'button'],
            'search': ['[type="search"]', '[placeholder*="search"]'],
            'menu': ['[role="menu"]', '.menu', '.dropdown'],
            'chat': ['[class*="chat"]', '[id*="chat"]', 'iframe[src*="chat"]']
        };

        const context = this.inferContext(selector);
        const contextSelectors = contextMap[context] || [];

        for (const contextSelector of contextSelectors) {
            try {
                const element = await this.page.locator(contextSelector).first();
                if (await element.isVisible()) {
                    return { element, selector: contextSelector, strategy: 'context' };
                }
            } catch (error) {
                continue;
            }
        }
        return null;
    }

    /**
     * Find element by visual similarity
     */
    async findBySimilarity(selector, options = {}) {
        try {
            // Use screenshot comparison for visual similarity
            const elements = await this.page.$$('button, input, a, [role="button"]');
            
            for (const element of elements) {
                const isVisible = await element.isVisible();
                if (isVisible) {
                    const text = await element.textContent();
                    const similarity = this.calculateTextSimilarity(selector, text || '');
                    
                    if (similarity > 0.7) {
                        return { element, selector: text, strategy: 'similarity', confidence: similarity };
                    }
                }
            }
        } catch (error) {
            console.warn('Similarity search failed:', error.message);
        }
        return null;
    }

    /**
     * Safe element interaction with retry logic
     */
    async safeInteraction(elementResult, action, value = null, options = {}) {
        const { retries = this.retryConfig.maxRetries, delay = this.retryConfig.retryDelay } = options;
        
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                await this.waitForElementStability(elementResult.element);
                
                const result = await this.performAction(elementResult.element, action, value);
                
                this.recordInteraction({
                    selector: elementResult.selector,
                    strategy: elementResult.strategy,
                    action,
                    value,
                    attempt,
                    success: true,
                    timestamp: new Date().toISOString()
                });
                
                return result;
            } catch (error) {
                console.warn(`Interaction attempt ${attempt + 1} failed:`, error.message);
                
                if (attempt < retries) {
                    await this.page.waitForTimeout(delay);
                    // Try to re-find the element
                    const refreshedElement = await this.findElement(elementResult.selector);
                    if (refreshedElement) {
                        elementResult = refreshedElement;
                    }
                } else {
                    this.recordInteraction({
                        selector: elementResult.selector,
                        strategy: elementResult.strategy,
                        action,
                        value,
                        attempt,
                        success: false,
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });
                    throw error;
                }
            }
        }
    }

    /**
     * Perform specific action on element
     */
    async performAction(element, action, value = null) {
        switch (action.toLowerCase()) {
            case 'click':
                return await element.click();
            case 'fill':
            case 'type':
                await element.clear();
                return await element.fill(value);
            case 'select':
                return await element.selectOption(value);
            case 'check':
                return await element.check();
            case 'uncheck':
                return await element.uncheck();
            case 'hover':
                return await element.hover();
            case 'focus':
                return await element.focus();
            case 'scroll':
                return await element.scrollIntoViewIfNeeded();
            case 'screenshot':
                return await element.screenshot();
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    /**
     * Wait for element to be stable (not moving/changing)
     */
    async waitForElementStability(element, timeout = 5000) {
        const startTime = Date.now();
        let lastBoundingBox = null;
        
        while (Date.now() - startTime < timeout) {
            try {
                const currentBoundingBox = await element.boundingBox();
                
                if (lastBoundingBox && this.boundingBoxesEqual(lastBoundingBox, currentBoundingBox)) {
                    return true;
                }
                
                lastBoundingBox = currentBoundingBox;
                await this.page.waitForTimeout(100);
            } catch (error) {
                // Element might not be ready yet
                await this.page.waitForTimeout(100);
            }
        }
        
        return false;
    }

    /**
     * Advanced element validation
     */
    async validateElement(elementResult, validations = {}) {
        const { element } = elementResult;
        const results = {};

        try {
            if (validations.visible !== undefined) {
                results.visible = await element.isVisible() === validations.visible;
            }
            
            if (validations.enabled !== undefined) {
                results.enabled = await element.isEnabled() === validations.enabled;
            }
            
            if (validations.text !== undefined) {
                const text = await element.textContent();
                results.text = text?.includes(validations.text) || false;
            }
            
            if (validations.value !== undefined) {
                const value = await element.inputValue();
                results.value = value === validations.value;
            }
            
            if (validations.attribute) {
                for (const [attr, expectedValue] of Object.entries(validations.attribute)) {
                    const actualValue = await element.getAttribute(attr);
                    results[`attribute_${attr}`] = actualValue === expectedValue;
                }
            }
            
            results.overall = Object.values(results).every(result => result === true);
        } catch (error) {
            results.error = error.message;
            results.overall = false;
        }

        return results;
    }

    /**
     * Helper methods
     */
    extractTextPatterns(selector) {
        const patterns = [];
        
        // Extract text from common patterns
        const textMatch = selector.match(/text[=:](["']?)([^"']+)\1/);
        if (textMatch) {
            patterns.push(textMatch[2]);
        }
        
        // Extract from data-testid
        const testIdMatch = selector.match(/data-testid[=:](["']?)([^"']+)\1/);
        if (testIdMatch) {
            patterns.push(testIdMatch[2]);
        }
        
        return patterns;
    }

    extractAttributes(selector) {
        const attributes = [];
        const attrRegex = /\[([^=]+)([=~|^$*]?)(["']?)([^"'\]]+)\3\]/g;
        let match;
        
        while ((match = attrRegex.exec(selector)) !== null) {
            attributes.push({
                name: match[1],
                operator: match[2] || '=',
                value: match[4]
            });
        }
        
        return attributes;
    }

    inferContext(selector) {
        const contextKeywords = {
            'login': /login|signin|sign-in/i,
            'submit': /submit|send|save|confirm/i,
            'search': /search|find|query/i,
            'menu': /menu|nav|dropdown/i,
            'chat': /chat|message|conversation/i
        };

        for (const [context, pattern] of Object.entries(contextKeywords)) {
            if (pattern.test(selector)) {
                return context;
            }
        }
        
        return 'general';
    }

    calculateTextSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    boundingBoxesEqual(box1, box2) {
        if (!box1 || !box2) return false;
        
        const tolerance = 1; // 1px tolerance
        return Math.abs(box1.x - box2.x) <= tolerance &&
               Math.abs(box1.y - box2.y) <= tolerance &&
               Math.abs(box1.width - box2.width) <= tolerance &&
               Math.abs(box1.height - box2.height) <= tolerance;
    }

    cacheElement(selector, element) {
        this.elementCache.set(selector, {
            element,
            timestamp: Date.now(),
            accessCount: (this.elementCache.get(selector)?.accessCount || 0) + 1
        });
    }

    recordInteraction(interaction) {
        this.interactionHistory.push(interaction);
        
        // Keep only last 100 interactions
        if (this.interactionHistory.length > 100) {
            this.interactionHistory.shift();
        }
    }

    getInteractionHistory() {
        return this.interactionHistory;
    }

    getElementCache() {
        return this.elementCache;
    }

    clearCache() {
        this.elementCache.clear();
    }
}

module.exports = ElementHelper;