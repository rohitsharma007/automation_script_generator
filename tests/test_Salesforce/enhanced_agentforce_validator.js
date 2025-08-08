/**
 * Enhanced Agentforce Validator
 * Advanced test automation with AI integration, intelligent element detection,
 * comprehensive analysis, and robust error handling
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Import enhanced utilities
const AIHelper = require('./common/utils/aiHelper');
const Crawler = require('./common/utils/crawler');
const ElementHelper = require('./common/utils/elementHelper');
const Logger = require('./common/utils/logger');
const Orchestrator = require('./common/utils/orchestrator');
const TestGenerator = require('./common/utils/testGenerator');
const WaitUtils = require('./common/utils/waitUtils');

class EnhancedAgentforceValidator {
    constructor(options = {}) {
        this.options = {
            headless: options.headless !== false,
            timeout: options.timeout || 60000,
            viewport: options.viewport || { width: 1920, height: 1080 },
            enableAI: options.enableAI !== false,
            enableVideoRecording: options.enableVideoRecording !== false,
            enableTracing: options.enableTracing !== false,
            enableScreenshots: options.enableScreenshots !== false,
            logLevel: options.logLevel || 'info',
            outputDir: options.outputDir || './reports',
            ...options
        };

        this.browser = null;
        this.page = null;
        this.context = null;
        
        // Initialize utilities
        this.logger = new Logger({ 
            level: this.options.logLevel,
            outputDir: this.options.outputDir
        });
        
        this.testResults = {
            timestamp: new Date().toISOString(),
            url: null,
            overall_score: 0,
            tests: {},
            ai_analysis: {},
            performance_metrics: {},
            accessibility_report: {},
            security_analysis: {},
            recommendations: [],
            errors: []
        };
        
        this.utilities = {};
    }

    /**
     * Initialize browser and utilities
     */
    async initialize() {
        this.logger.info('Initializing Enhanced Agentforce Validator');
        
        try {
            // Launch browser
            this.browser = await chromium.launch({
                headless: this.options.headless,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            // Create context with enhanced options
            const contextOptions = {
                viewport: this.options.viewport,
                recordVideo: this.options.enableVideoRecording ? {
                    dir: path.join(this.options.outputDir, 'videos'),
                    size: this.options.viewport
                } : undefined
            };

            this.context = await this.browser.newContext(contextOptions);
            
            // Enable tracing if requested
            if (this.options.enableTracing) {
                await this.context.tracing.start({
                    screenshots: true,
                    snapshots: true,
                    sources: true
                });
            }

            this.page = await this.context.newPage();
            
            // Initialize utilities with page instance
            this.utilities = {
                ai: this.options.enableAI ? new AIHelper() : null,
                crawler: new Crawler(this.page),
                elementHelper: new ElementHelper(this.page),
                waitUtils: new WaitUtils(this.page, { logLevel: this.options.logLevel }),
                testGenerator: new TestGenerator(this.page, { enableAI: this.options.enableAI }),
                orchestrator: new Orchestrator(this.page, {
                    aiHelper: this.options.enableAI ? new AIHelper() : null,
                    logger: this.logger
                })
            };

            // Set up page event listeners
            this.setupPageEventListeners();
            
            this.logger.info('Enhanced Agentforce Validator initialized successfully');
        } catch (error) {
            this.logger.error('Initialization failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Set up page event listeners for monitoring
     */
    setupPageEventListeners() {
        // Network monitoring
        this.page.on('request', request => {
            this.logger.network('Request', {
                url: request.url(),
                method: request.method(),
                resourceType: request.resourceType()
            });
        });

        this.page.on('response', response => {
            this.logger.network('Response', {
                url: response.url(),
                status: response.status(),
                contentType: response.headers()['content-type']
            });
        });

        // Console monitoring
        this.page.on('console', msg => {
            this.logger.browserEvent('Console', {
                type: msg.type(),
                text: msg.text(),
                location: msg.location()
            });
        });

        // Error monitoring
        this.page.on('pageerror', error => {
            this.logger.error('Page Error', { error: error.message });
            this.testResults.errors.push({
                type: 'page_error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        });
    }

    /**
     * Validate Agentforce implementation with comprehensive analysis
     */
    async validateAgentforce(url) {
        this.logger.info('Starting comprehensive Agentforce validation', { url });
        this.testResults.url = url;
        
        try {
            // Navigate to the page
            await this.navigateToPage(url);
            
            // Perform comprehensive page analysis
            const pageAnalysis = await this.performPageAnalysis();
            
            // Run core Agentforce tests
            await this.runCoreAgentforceTests();
            
            // Generate and run AI-powered tests
            if (this.utilities.ai && this.utilities.ai.isAIAvailable()) {
                await this.runAIGeneratedTests();
            }
            
            // Perform accessibility analysis
            await this.performAccessibilityAnalysis();
            
            // Perform security analysis
            await this.performSecurityAnalysis();
            
            // Perform performance analysis
            await this.performPerformanceAnalysis();
            
            // Generate comprehensive report
            await this.generateComprehensiveReport(pageAnalysis);
            
            this.logger.info('Agentforce validation completed', {
                score: this.testResults.overall_score,
                testsRun: Object.keys(this.testResults.tests).length
            });
            
            return this.testResults;
        } catch (error) {
            this.logger.error('Validation failed', { error: error.message });
            this.testResults.errors.push({
                type: 'validation_error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }

    /**
     * Navigate to page with intelligent waiting
     */
    async navigateToPage(url) {
        this.logger.info('Navigating to page', { url });
        
        try {
            await this.page.goto(url, { 
                waitUntil: 'domcontentloaded',
                timeout: this.options.timeout 
            });
            
            // Wait for page to be fully loaded
            await this.utilities.waitUtils.waitForPageLoad({
                timeout: 30000,
                waitForImages: true,
                waitForFonts: true
            });
            
            // Take initial screenshot
            if (this.options.enableScreenshots) {
                await this.takeScreenshot('initial_page_load');
            }
            
            this.logger.info('Page navigation completed', { 
                url: this.page.url(),
                title: await this.page.title()
            });
        } catch (error) {
            this.logger.error('Navigation failed', { url, error: error.message });
            throw error;
        }
    }

    /**
     * Perform comprehensive page analysis
     */
    async performPageAnalysis() {
        this.logger.info('Performing comprehensive page analysis');
        
        try {
            const analysis = await this.utilities.crawler.analyzePage({
                includePerformance: true,
                includeAccessibility: true,
                includeSEO: true,
                includeStructure: true
            });
            
            this.testResults.page_analysis = analysis;
            this.logger.info('Page analysis completed', {
                elements: analysis.elements.total,
                forms: analysis.forms.length,
                links: analysis.links.length
            });
            
            return analysis;
        } catch (error) {
            this.logger.error('Page analysis failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Run core Agentforce tests
     */
    async runCoreAgentforceTests() {
        this.logger.info('Running core Agentforce tests');
        
        const tests = [
            { name: 'agentforce_presence', fn: this.testAgentforcePresence.bind(this) },
            { name: 'chat_interface', fn: this.testChatInterface.bind(this) },
            { name: 'agent_responsiveness', fn: this.testAgentResponsiveness.bind(this) },
            { name: 'conversation_flow', fn: this.testConversationFlow.bind(this) },
            { name: 'error_handling', fn: this.testErrorHandling.bind(this) },
            { name: 'accessibility_compliance', fn: this.testAccessibilityCompliance.bind(this) }
        ];
        
        for (const test of tests) {
            try {
                this.logger.test('Running test', { testName: test.name });
                const result = await test.fn();
                this.testResults.tests[test.name] = result;
                this.logger.test('Test completed', { testName: test.name, passed: result.passed });
            } catch (error) {
                this.logger.error('Test failed', { testName: test.name, error: error.message });
                this.testResults.tests[test.name] = {
                    passed: false,
                    score: 0,
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
            }
        }
    }

    /**
     * Test Agentforce presence with intelligent detection
     */
    async testAgentforcePresence() {
        this.logger.test('Testing Agentforce presence');
        
        const agentforceSelectors = [
            '[data-testid*="agentforce"]',
            '[class*="agentforce"]',
            '[id*="agentforce"]',
            '.chat-widget',
            '.chat-container',
            '.assistant-widget',
            'iframe[src*="chat"]',
            'iframe[src*="assistant"]'
        ];
        
        try {
            const foundElements = [];
            
            for (const selector of agentforceSelectors) {
                const elements = await this.utilities.elementHelper.findElementsSmart(selector, {
                    timeout: 5000,
                    strategy: 'multiple'
                });
                
                if (elements.length > 0) {
                    foundElements.push(...elements.map(el => ({ selector, element: el })));
                }
            }
            
            const score = foundElements.length > 0 ? 100 : 0;
            
            return {
                passed: foundElements.length > 0,
                score,
                details: {
                    elementsFound: foundElements.length,
                    selectors: foundElements.map(fe => fe.selector)
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                passed: false,
                score: 0,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Test chat interface functionality
     */
    async testChatInterface() {
        this.logger.test('Testing chat interface');
        
        try {
            // Look for chat input elements
            const chatInputSelectors = [
                'input[placeholder*="chat"]',
                'input[placeholder*="message"]',
                'textarea[placeholder*="chat"]',
                'textarea[placeholder*="message"]',
                '[data-testid*="chat-input"]',
                '[class*="chat-input"]'
            ];
            
            let chatInput = null;
            for (const selector of chatInputSelectors) {
                chatInput = await this.utilities.elementHelper.findElementSmart(selector, {
                    timeout: 3000,
                    visible: true
                });
                if (chatInput) break;
            }
            
            if (!chatInput) {
                return {
                    passed: false,
                    score: 0,
                    details: { reason: 'No chat input found' },
                    timestamp: new Date().toISOString()
                };
            }
            
            // Test input interaction
            const testMessage = 'Hello, I need help with my account';
            await this.utilities.elementHelper.interactWithElement(chatInput, 'fill', testMessage);
            
            // Look for send button
            const sendButtonSelectors = [
                'button[type="submit"]',
                'button[aria-label*="send"]',
                '[data-testid*="send"]',
                '.send-button',
                '.chat-send'
            ];
            
            let sendButton = null;
            for (const selector of sendButtonSelectors) {
                sendButton = await this.utilities.elementHelper.findElementSmart(selector, {
                    timeout: 2000,
                    visible: true
                });
                if (sendButton) break;
            }
            
            let score = 50; // Base score for having input
            
            if (sendButton) {
                score += 30; // Additional score for send button
                
                // Test send functionality
                try {
                    await this.utilities.elementHelper.interactWithElement(sendButton, 'click');
                    await this.utilities.waitUtils.waitForNetworkIdle({ timeout: 5000 });
                    score += 20; // Additional score for successful send
                } catch (error) {
                    this.logger.warn('Send button interaction failed', { error: error.message });
                }
            }
            
            return {
                passed: score >= 50,
                score,
                details: {
                    hasInput: !!chatInput,
                    hasSendButton: !!sendButton,
                    testMessage
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                passed: false,
                score: 0,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Test agent responsiveness
     */
    async testAgentResponsiveness() {
        this.logger.test('Testing agent responsiveness');
        
        try {
            // Look for response indicators
            const responseSelectors = [
                '.chat-message',
                '.agent-response',
                '.bot-message',
                '[data-testid*="response"]',
                '[class*="response"]'
            ];
            
            const startTime = Date.now();
            let responseFound = false;
            
            // Wait for response with timeout
            for (const selector of responseSelectors) {
                try {
                    await this.utilities.waitUtils.waitForElement(selector, {
                        timeout: 10000,
                        visible: true
                    });
                    responseFound = true;
                    break;
                } catch (error) {
                    // Continue to next selector
                }
            }
            
            const responseTime = Date.now() - startTime;
            let score = 0;
            
            if (responseFound) {
                if (responseTime < 3000) score = 100;
                else if (responseTime < 5000) score = 80;
                else if (responseTime < 10000) score = 60;
                else score = 40;
            }
            
            return {
                passed: responseFound,
                score,
                details: {
                    responseTime,
                    responseFound
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                passed: false,
                score: 0,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Test conversation flow
     */
    async testConversationFlow() {
        this.logger.test('Testing conversation flow');
        
        try {
            // This would involve more complex conversation testing
            // For now, we'll check for conversation history elements
            const conversationSelectors = [
                '.chat-history',
                '.conversation-container',
                '.message-list',
                '[data-testid*="conversation"]'
            ];
            
            let conversationContainer = null;
            for (const selector of conversationSelectors) {
                conversationContainer = await this.utilities.elementHelper.findElementSmart(selector, {
                    timeout: 3000
                });
                if (conversationContainer) break;
            }
            
            const score = conversationContainer ? 75 : 25;
            
            return {
                passed: !!conversationContainer,
                score,
                details: {
                    hasConversationContainer: !!conversationContainer
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                passed: false,
                score: 0,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Test error handling
     */
    async testErrorHandling() {
        this.logger.test('Testing error handling');
        
        try {
            // Test with invalid input
            const chatInput = await this.utilities.elementHelper.findElementSmart(
                'input[placeholder*="chat"], textarea[placeholder*="chat"]',
                { timeout: 5000 }
            );
            
            if (chatInput) {
                // Send potentially problematic input
                const testInputs = [
                    '', // Empty input
                    'a'.repeat(1000), // Very long input
                    '<script>alert("test")</script>' // XSS attempt
                ];
                
                let errorHandlingScore = 0;
                
                for (const input of testInputs) {
                    try {
                        await this.utilities.elementHelper.interactWithElement(chatInput, 'fill', input);
                        await this.page.keyboard.press('Enter');
                        await this.utilities.waitUtils.waitForNetworkIdle({ timeout: 3000 });
                        
                        // Check for error messages or validation
                        const errorSelectors = [
                            '.error-message',
                            '.validation-error',
                            '[role="alert"]',
                            '.alert-danger'
                        ];
                        
                        for (const selector of errorSelectors) {
                            const errorElement = await this.utilities.elementHelper.findElementSmart(selector, {
                                timeout: 2000
                            });
                            if (errorElement) {
                                errorHandlingScore += 25;
                                break;
                            }
                        }
                    } catch (error) {
                        // Error in test execution, not necessarily bad error handling
                    }
                }
                
                return {
                    passed: errorHandlingScore > 0,
                    score: Math.min(errorHandlingScore, 100),
                    details: {
                        testsRun: testInputs.length,
                        errorHandlingScore
                    },
                    timestamp: new Date().toISOString()
                };
            }
            
            return {
                passed: false,
                score: 0,
                details: { reason: 'No chat input found for error testing' },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                passed: false,
                score: 0,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Test accessibility compliance
     */
    async testAccessibilityCompliance() {
        this.logger.test('Testing accessibility compliance');
        
        try {
            // Basic accessibility checks
            const accessibilityIssues = [];
            let score = 100;
            
            // Check for alt text on images
            const images = await this.page.$$('img');
            for (const img of images) {
                const alt = await img.getAttribute('alt');
                if (!alt) {
                    accessibilityIssues.push('Image without alt text');
                    score -= 10;
                }
            }
            
            // Check for form labels
            const inputs = await this.page.$$('input, textarea, select');
            for (const input of inputs) {
                const id = await input.getAttribute('id');
                const ariaLabel = await input.getAttribute('aria-label');
                
                if (id) {
                    const label = await this.page.$(`label[for="${id}"]`);
                    if (!label && !ariaLabel) {
                        accessibilityIssues.push('Form input without label');
                        score -= 15;
                    }
                } else if (!ariaLabel) {
                    accessibilityIssues.push('Form input without label or aria-label');
                    score -= 15;
                }
            }
            
            // Check for heading structure
            const headings = await this.page.$$('h1, h2, h3, h4, h5, h6');
            if (headings.length === 0) {
                accessibilityIssues.push('No heading structure found');
                score -= 20;
            }
            
            score = Math.max(score, 0);
            
            return {
                passed: score >= 70,
                score,
                details: {
                    issues: accessibilityIssues,
                    imagesChecked: images.length,
                    inputsChecked: inputs.length,
                    headingsFound: headings.length
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                passed: false,
                score: 0,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Run AI-generated tests
     */
    async runAIGeneratedTests() {
        if (!this.utilities.ai || !this.utilities.ai.isAIAvailable()) {
            this.logger.info('AI not available, skipping AI-generated tests');
            return;
        }
        
        this.logger.info('Running AI-generated tests');
        
        try {
            // Generate test suite using AI
            const testSuite = await this.utilities.testGenerator.generateTestSuite(
                this.page.url(),
                'Agentforce chat interface validation'
            );
            
            this.testResults.ai_analysis.generated_tests = testSuite;
            
            // Run a subset of generated tests
            if (testSuite.testCategories.ai_generated && testSuite.testCategories.ai_generated.tests.length > 0) {
                const aiTests = testSuite.testCategories.ai_generated.tests.slice(0, 3); // Run first 3 AI tests
                
                for (const test of aiTests) {
                    try {
                        const result = await this.executeAIGeneratedTest(test);
                        this.testResults.tests[`ai_${test.id}`] = result;
                    } catch (error) {
                        this.logger.error('AI test execution failed', { testId: test.id, error: error.message });
                    }
                }
            }
        } catch (error) {
            this.logger.error('AI test generation failed', { error: error.message });
        }
    }

    /**
     * Execute AI-generated test
     */
    async executeAIGeneratedTest(test) {
        this.logger.info('Executing AI-generated test', { testName: test.name });
        
        try {
            let score = 0;
            const executedSteps = [];
            
            for (const step of test.steps) {
                try {
                    await this.executeTestStep(step);
                    executedSteps.push({ ...step, success: true });
                    score += 100 / test.steps.length;
                } catch (error) {
                    executedSteps.push({ ...step, success: false, error: error.message });
                }
            }
            
            return {
                passed: score >= 70,
                score: Math.round(score),
                details: {
                    stepsExecuted: executedSteps.length,
                    stepsSuccessful: executedSteps.filter(s => s.success).length,
                    executedSteps
                },
                aiGenerated: true,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                passed: false,
                score: 0,
                error: error.message,
                aiGenerated: true,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Execute individual test step
     */
    async executeTestStep(step) {
        switch (step.action) {
            case 'navigate':
                if (step.url) {
                    await this.page.goto(step.url);
                }
                break;
            case 'click':
                if (step.selector) {
                    await this.utilities.elementHelper.interactWithElement(
                        await this.utilities.elementHelper.findElementSmart(step.selector),
                        'click'
                    );
                }
                break;
            case 'fill':
                if (step.selector && step.value) {
                    await this.utilities.elementHelper.interactWithElement(
                        await this.utilities.elementHelper.findElementSmart(step.selector),
                        'fill',
                        step.value
                    );
                }
                break;
            case 'verify':
                // Basic verification - check if element exists
                if (step.selector) {
                    await this.utilities.elementHelper.findElementSmart(step.selector, { timeout: 5000 });
                }
                break;
            default:
                this.logger.debug('Unknown test step action', { action: step.action });
        }
    }

    /**
     * Perform accessibility analysis
     */
    async performAccessibilityAnalysis() {
        this.logger.info('Performing accessibility analysis');
        
        try {
            // This would integrate with axe-core or similar tools
            // For now, we'll do basic checks
            const accessibilityReport = {
                timestamp: new Date().toISOString(),
                checks: [],
                score: 0
            };
            
            // Color contrast check
            const contrastIssues = await this.checkColorContrast();
            accessibilityReport.checks.push({
                name: 'color_contrast',
                passed: contrastIssues.length === 0,
                issues: contrastIssues
            });
            
            // Keyboard navigation check
            const keyboardIssues = await this.checkKeyboardNavigation();
            accessibilityReport.checks.push({
                name: 'keyboard_navigation',
                passed: keyboardIssues.length === 0,
                issues: keyboardIssues
            });
            
            // Calculate overall accessibility score
            const passedChecks = accessibilityReport.checks.filter(check => check.passed).length;
            accessibilityReport.score = (passedChecks / accessibilityReport.checks.length) * 100;
            
            this.testResults.accessibility_report = accessibilityReport;
        } catch (error) {
            this.logger.error('Accessibility analysis failed', { error: error.message });
        }
    }

    /**
     * Check color contrast
     */
    async checkColorContrast() {
        // Simplified color contrast check
        // In a real implementation, this would use axe-core or similar
        return [];
    }

    /**
     * Check keyboard navigation
     */
    async checkKeyboardNavigation() {
        const issues = [];
        
        try {
            // Test tab navigation
            const focusableElements = await this.page.$$(
                'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length === 0) {
                issues.push('No focusable elements found');
            }
            
            // Test if elements can receive focus
            for (let i = 0; i < Math.min(focusableElements.length, 5); i++) {
                try {
                    await focusableElements[i].focus();
                } catch (error) {
                    issues.push(`Element ${i} cannot receive focus`);
                }
            }
        } catch (error) {
            issues.push(`Keyboard navigation test failed: ${error.message}`);
        }
        
        return issues;
    }

    /**
     * Perform security analysis
     */
    async performSecurityAnalysis() {
        this.logger.info('Performing security analysis');
        
        try {
            const securityReport = {
                timestamp: new Date().toISOString(),
                checks: [],
                score: 0
            };
            
            // HTTPS check
            const isHTTPS = this.page.url().startsWith('https://');
            securityReport.checks.push({
                name: 'https_protocol',
                passed: isHTTPS,
                details: { protocol: this.page.url().split(':')[0] }
            });
            
            // Security headers check
            const response = await this.page.goto(this.page.url());
            const headers = response.headers();
            
            const securityHeaders = [
                'content-security-policy',
                'x-frame-options',
                'x-content-type-options',
                'strict-transport-security'
            ];
            
            const missingHeaders = securityHeaders.filter(header => !headers[header]);
            securityReport.checks.push({
                name: 'security_headers',
                passed: missingHeaders.length === 0,
                details: { missingHeaders }
            });
            
            // Calculate security score
            const passedChecks = securityReport.checks.filter(check => check.passed).length;
            securityReport.score = (passedChecks / securityReport.checks.length) * 100;
            
            this.testResults.security_analysis = securityReport;
        } catch (error) {
            this.logger.error('Security analysis failed', { error: error.message });
        }
    }

    /**
     * Perform performance analysis
     */
    async performPerformanceAnalysis() {
        this.logger.info('Performing performance analysis');
        
        try {
            const performanceMetrics = await this.page.evaluate(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');
                
                return {
                    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                    timestamp: new Date().toISOString()
                };
            });
            
            // Calculate performance score
            let score = 100;
            if (performanceMetrics.loadTime > 3000) score -= 20;
            if (performanceMetrics.firstContentfulPaint > 1500) score -= 15;
            if (performanceMetrics.domContentLoaded > 2000) score -= 15;
            
            performanceMetrics.score = Math.max(score, 0);
            
            this.testResults.performance_metrics = performanceMetrics;
        } catch (error) {
            this.logger.error('Performance analysis failed', { error: error.message });
        }
    }

    /**
     * Generate comprehensive report
     */
    async generateComprehensiveReport(pageAnalysis) {
        this.logger.info('Generating comprehensive report');
        
        try {
            // Calculate overall score
            const testScores = Object.values(this.testResults.tests)
                .filter(test => typeof test.score === 'number')
                .map(test => test.score);
            
            const averageTestScore = testScores.length > 0 
                ? testScores.reduce((sum, score) => sum + score, 0) / testScores.length 
                : 0;
            
            const performanceScore = this.testResults.performance_metrics?.score || 0;
            const accessibilityScore = this.testResults.accessibility_report?.score || 0;
            const securityScore = this.testResults.security_analysis?.score || 0;
            
            this.testResults.overall_score = Math.round(
                (averageTestScore * 0.4 + performanceScore * 0.2 + accessibilityScore * 0.2 + securityScore * 0.2)
            );
            
            // Generate recommendations
            this.generateRecommendations();
            
            // Add summary
            this.testResults.summary = {
                testsRun: Object.keys(this.testResults.tests).length,
                testsPassed: Object.values(this.testResults.tests).filter(test => test.passed).length,
                averageTestScore: Math.round(averageTestScore),
                performanceScore,
                accessibilityScore,
                securityScore,
                overallScore: this.testResults.overall_score
            };
            
            // Save report
            await this.saveReport();
            
        } catch (error) {
            this.logger.error('Report generation failed', { error: error.message });
        }
    }

    /**
     * Generate recommendations based on test results
     */
    generateRecommendations() {
        const recommendations = [];
        
        // Test-based recommendations
        if (this.testResults.tests.agentforce_presence && !this.testResults.tests.agentforce_presence.passed) {
            recommendations.push({
                category: 'functionality',
                priority: 'high',
                message: 'Agentforce presence not detected. Ensure Agentforce is properly implemented and visible.'
            });
        }
        
        if (this.testResults.tests.chat_interface && this.testResults.tests.chat_interface.score < 70) {
            recommendations.push({
                category: 'usability',
                priority: 'high',
                message: 'Chat interface functionality is limited. Improve input handling and send button functionality.'
            });
        }
        
        // Performance recommendations
        if (this.testResults.performance_metrics && this.testResults.performance_metrics.score < 70) {
            recommendations.push({
                category: 'performance',
                priority: 'medium',
                message: 'Page performance needs improvement. Consider optimizing load times and resource loading.'
            });
        }
        
        // Accessibility recommendations
        if (this.testResults.accessibility_report && this.testResults.accessibility_report.score < 80) {
            recommendations.push({
                category: 'accessibility',
                priority: 'high',
                message: 'Accessibility compliance needs improvement. Address keyboard navigation and screen reader compatibility.'
            });
        }
        
        // Security recommendations
        if (this.testResults.security_analysis && this.testResults.security_analysis.score < 90) {
            recommendations.push({
                category: 'security',
                priority: 'high',
                message: 'Security measures need enhancement. Implement proper security headers and HTTPS.'
            });
        }
        
        this.testResults.recommendations = recommendations;
    }

    /**
     * Take screenshot
     */
    async takeScreenshot(name) {
        try {
            const screenshotPath = path.join(this.options.outputDir, 'screenshots', `${name}.png`);
            await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
            await this.page.screenshot({ path: screenshotPath, fullPage: true });
            this.logger.debug('Screenshot taken', { path: screenshotPath });
        } catch (error) {
            this.logger.warn('Screenshot failed', { name, error: error.message });
        }
    }

    /**
     * Save comprehensive report
     */
    async saveReport() {
        try {
            const reportPath = path.join(this.options.outputDir, 'enhanced_agentforce_validation_report.json');
            await fs.mkdir(path.dirname(reportPath), { recursive: true });
            await fs.writeFile(reportPath, JSON.stringify(this.testResults, null, 2));
            
            this.logger.info('Report saved', { path: reportPath });
            
            // Also save a human-readable summary
            const summaryPath = path.join(this.options.outputDir, 'validation_summary.md');
            await this.generateMarkdownSummary(summaryPath);
            
        } catch (error) {
            this.logger.error('Report saving failed', { error: error.message });
        }
    }

    /**
     * Generate markdown summary
     */
    async generateMarkdownSummary(filePath) {
        const summary = `# Enhanced Agentforce Validation Report

## Overview
- **URL**: ${this.testResults.url}
- **Timestamp**: ${this.testResults.timestamp}
- **Overall Score**: ${this.testResults.overall_score}/100

## Test Results
${Object.entries(this.testResults.tests).map(([name, result]) => 
    `- **${name}**: ${result.passed ? '✅ PASSED' : '❌ FAILED'} (Score: ${result.score}/100)`
).join('\n')}

## Performance Metrics
- **Load Time**: ${this.testResults.performance_metrics?.loadTime || 'N/A'}ms
- **First Contentful Paint**: ${this.testResults.performance_metrics?.firstContentfulPaint || 'N/A'}ms
- **Performance Score**: ${this.testResults.performance_metrics?.score || 'N/A'}/100

## Accessibility Score
${this.testResults.accessibility_report?.score || 'N/A'}/100

## Security Score
${this.testResults.security_analysis?.score || 'N/A'}/100

## Recommendations
${this.testResults.recommendations.map(rec => 
    `- **${rec.category.toUpperCase()}** (${rec.priority}): ${rec.message}`
).join('\n')}

## Errors
${this.testResults.errors.length > 0 ? 
    this.testResults.errors.map(error => `- ${error.type}: ${error.message}`).join('\n') : 
    'No errors encountered'
}
`;
        
        await fs.writeFile(filePath, summary);
        this.logger.info('Markdown summary generated', { path: filePath });
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        this.logger.info('Cleaning up resources');
        
        try {
            // Stop tracing if enabled
            if (this.options.enableTracing && this.context) {
                const tracePath = path.join(this.options.outputDir, 'traces', 'enhanced_validation_trace.zip');
                await fs.mkdir(path.dirname(tracePath), { recursive: true });
                await this.context.tracing.stop({ path: tracePath });
                this.logger.info('Trace saved', { path: tracePath });
            }
            
            // Close browser
            if (this.browser) {
                await this.browser.close();
            }
            
            this.logger.info('Cleanup completed');
        } catch (error) {
            this.logger.error('Cleanup failed', { error: error.message });
        }
    }
}

// Export for use as module
module.exports = EnhancedAgentforceValidator;

// CLI execution
if (require.main === module) {
    const url = process.argv[2] || 'https://www.salesforce.com';
    
    const validator = new EnhancedAgentforceValidator({
        headless: process.env.HEADLESS !== 'false',
        enableAI: process.env.ENABLE_AI !== 'false',
        enableVideoRecording: process.env.ENABLE_VIDEO === 'true',
        enableTracing: process.env.ENABLE_TRACING === 'true',
        enableScreenshots: process.env.ENABLE_SCREENSHOTS !== 'false',
        logLevel: process.env.LOG_LEVEL || 'info'
    });
    
    (async () => {
        try {
            await validator.initialize();
            const results = await validator.validateAgentforce(url);
            
            console.log('\n=== ENHANCED AGENTFORCE VALIDATION COMPLETED ===');
            console.log(`Overall Score: ${results.overall_score}/100`);
            console.log(`Tests Run: ${Object.keys(results.tests).length}`);
            console.log(`Tests Passed: ${Object.values(results.tests).filter(test => test.passed).length}`);
            
            if (results.recommendations.length > 0) {
                console.log('\nTop Recommendations:');
                results.recommendations.slice(0, 3).forEach(rec => {
                    console.log(`- ${rec.message}`);
                });
            }
            
            process.exit(results.overall_score >= 70 ? 0 : 1);
        } catch (error) {
            console.error('Validation failed:', error.message);
            process.exit(1);
        } finally {
            await validator.cleanup();
        }
    })();
}