/**
 * Intelligent Test Generator
 * Generates comprehensive test cases using AI, page analysis, and pattern recognition
 */

const AIHelper = require('./aiHelper');
const Crawler = require('./crawler');
const Logger = require('./logger');

class TestGenerator {
    constructor(page, options = {}) {
        this.page = page;
        this.options = {
            enableAI: options.enableAI !== false,
            testTypes: options.testTypes || ['functional', 'ui', 'integration', 'accessibility'],
            maxTestsPerType: options.maxTestsPerType || 10,
            includeNegativeTests: options.includeNegativeTests !== false,
            includeEdgeCases: options.includeEdgeCases !== false,
            logLevel: options.logLevel || 'info',
            ...options
        };

        this.logger = new Logger({ level: this.options.logLevel });
        this.aiHelper = this.options.enableAI ? new AIHelper() : null;
        this.crawler = new Crawler(page);
        
        this.testPatterns = new Map();
        this.generatedTests = new Map();
        this.testTemplates = this.initializeTestTemplates();
    }

    /**
     * Generate comprehensive test suite for a page
     */
    async generateTestSuite(url, testObjective = 'comprehensive testing') {
        this.logger.info('Starting test suite generation', { url, objective: testObjective });
        
        try {
            // Navigate to page if not already there
            if (this.page.url() !== url) {
                await this.page.goto(url);
            }

            // Analyze page structure
            const pageAnalysis = await this.crawler.analyzePage({
                includePerformance: true,
                includeAccessibility: true,
                includeSEO: true
            });

            // Generate tests based on analysis
            const testSuite = {
                url,
                objective: testObjective,
                timestamp: new Date().toISOString(),
                pageAnalysis,
                testCategories: {},
                summary: {}
            };

            // Generate different types of tests
            for (const testType of this.options.testTypes) {
                this.logger.debug(`Generating ${testType} tests`);
                testSuite.testCategories[testType] = await this.generateTestsByType(testType, pageAnalysis, testObjective);
            }

            // Generate AI-powered tests if available
            if (this.aiHelper && this.aiHelper.isAIAvailable()) {
                testSuite.testCategories.ai_generated = await this.generateAITests(pageAnalysis, testObjective);
            }

            // Generate summary
            testSuite.summary = this.generateTestSuiteSummary(testSuite);

            this.logger.info('Test suite generation completed', { 
                totalTests: testSuite.summary.totalTests,
                categories: Object.keys(testSuite.testCategories)
            });

            return testSuite;
        } catch (error) {
            this.logger.error('Test suite generation failed', { error: error.message, url });
            throw error;
        }
    }

    /**
     * Generate tests by specific type
     */
    async generateTestsByType(testType, pageAnalysis, objective) {
        const tests = [];
        
        switch (testType) {
            case 'functional':
                tests.push(...await this.generateFunctionalTests(pageAnalysis));
                break;
            case 'ui':
                tests.push(...await this.generateUITests(pageAnalysis));
                break;
            case 'integration':
                tests.push(...await this.generateIntegrationTests(pageAnalysis));
                break;
            case 'accessibility':
                tests.push(...await this.generateAccessibilityTests(pageAnalysis));
                break;
            case 'performance':
                tests.push(...await this.generatePerformanceTests(pageAnalysis));
                break;
            case 'security':
                tests.push(...await this.generateSecurityTests(pageAnalysis));
                break;
            default:
                this.logger.warn(`Unknown test type: ${testType}`);
        }

        return {
            type: testType,
            count: tests.length,
            tests: tests.slice(0, this.options.maxTestsPerType)
        };
    }

    /**
     * Generate functional tests
     */
    async generateFunctionalTests(pageAnalysis) {
        const tests = [];
        
        // Form-based tests
        for (const form of pageAnalysis.forms) {
            tests.push(...this.generateFormTests(form));
        }

        // Navigation tests
        for (const link of pageAnalysis.links.slice(0, 5)) {
            tests.push({
                id: `navigation_${link.href ? link.href.replace(/[^a-zA-Z0-9]/g, '_') : 'link'}`,
                name: `Navigation Test - ${link.text || link.href || 'Link'}`,
                description: 'Test navigation functionality and link behavior',
                type: 'functional',
                priority: 'medium',
                steps: [
                    { action: 'click', selector: link.selector || `a[href="${link.href}"]`, description: `Click on ${link.text || 'link'}` },
                    { action: 'waitForNavigation', params: {}, description: 'Wait for page navigation' },
                    { action: 'verifyURL', params: { expected: link.href }, description: 'Verify correct URL' }
                ],
                assertions: [
                    { type: 'navigation', description: 'Should navigate to correct URL' },
                    { type: 'page', description: 'Page should load successfully' }
                ]
            });
        }

        // Interactive element tests
        for (const element of pageAnalysis.elements.interactive) {
            if (element.tag === 'button') {
                tests.push(this.generateButtonTest(element));
            }
        }

        // Search functionality tests
        const searchElements = pageAnalysis.elements.interactive.filter(el => 
            el.type === 'search' || (el.text && el.text.toLowerCase().includes('search'))
        );
        
        for (const searchElement of searchElements) {
            tests.push(...this.generateSearchTests(searchElement));
        }

        return tests;
    }

    /**
     * Generate UI tests
     */
    async generateUITests(pageAnalysis) {
        const tests = [];

        // Layout tests
        tests.push({
            id: 'ui_layout_responsive',
            name: 'Responsive Layout Test',
            description: 'Verify page layout adapts to different screen sizes',
            type: 'ui',
            priority: 'high',
            steps: [
                { action: 'setViewportSize', params: { width: 1920, height: 1080 } },
                { action: 'screenshot', params: { name: 'desktop_layout' } },
                { action: 'setViewportSize', params: { width: 768, height: 1024 } },
                { action: 'screenshot', params: { name: 'tablet_layout' } },
                { action: 'setViewportSize', params: { width: 375, height: 667 } },
                { action: 'screenshot', params: { name: 'mobile_layout' } }
            ],
            assertions: [
                { type: 'visual', description: 'Layout should adapt to different screen sizes' }
            ]
        });

        // Visual regression tests
        tests.push({
            id: 'ui_visual_regression',
            name: 'Visual Regression Test',
            description: 'Detect unexpected visual changes',
            type: 'ui',
            priority: 'medium',
            steps: [
                { action: 'screenshot', params: { name: 'baseline', fullPage: true } }
            ],
            assertions: [
                { type: 'visual', description: 'Page should match baseline screenshot' }
            ]
        });

        // Color contrast tests
        if (pageAnalysis.accessibility) {
            tests.push({
                id: 'ui_color_contrast',
                name: 'Color Contrast Test',
                description: 'Verify adequate color contrast for accessibility',
                type: 'ui',
                priority: 'high',
                steps: [
                    { action: 'analyzeColorContrast', params: {} }
                ],
                assertions: [
                    { type: 'accessibility', description: 'Color contrast should meet WCAG guidelines' }
                ]
            });
        }

        return tests;
    }

    /**
     * Generate integration tests
     */
    async generateIntegrationTests(pageAnalysis) {
        const tests = [];

        // API integration tests
        tests.push({
            id: 'integration_api_endpoints',
            name: 'API Endpoints Test',
            description: 'Verify API endpoints are accessible and return expected data',
            type: 'integration',
            priority: 'high',
            steps: [
                { action: 'interceptNetworkRequests', params: {} },
                { action: 'triggerAPICall', params: { method: 'GET' } },
                { action: 'validateAPIResponse', params: {} }
            ],
            assertions: [
                { type: 'network', description: 'API should return 200 status code' },
                { type: 'data', description: 'Response should contain expected data structure' }
            ]
        });

        // Third-party integration tests
        if (pageAnalysis.scripts && pageAnalysis.scripts.length > 0) {
            tests.push({
                id: 'integration_third_party',
                name: 'Third-party Integration Test',
                description: 'Verify third-party services load correctly',
                type: 'integration',
                priority: 'medium',
                steps: [
                    { action: 'monitorNetworkRequests', params: {} },
                    { action: 'waitForThirdPartyScripts', params: {} }
                ],
                assertions: [
                    { type: 'network', description: 'Third-party scripts should load successfully' }
                ]
            });
        }

        return tests;
    }

    /**
     * Generate accessibility tests
     */
    async generateAccessibilityTests(pageAnalysis) {
        const tests = [];

        // Keyboard navigation test
        tests.push({
            id: 'a11y_keyboard_navigation',
            name: 'Keyboard Navigation Test',
            description: 'Verify all interactive elements are keyboard accessible',
            type: 'accessibility',
            priority: 'high',
            steps: [
                { action: 'tabThroughElements', params: {} },
                { action: 'verifyFocusIndicators', params: {} }
            ],
            assertions: [
                { type: 'accessibility', description: 'All interactive elements should be reachable via keyboard' },
                { type: 'accessibility', description: 'Focus indicators should be visible' }
            ]
        });

        // Screen reader test
        tests.push({
            id: 'a11y_screen_reader',
            name: 'Screen Reader Compatibility Test',
            description: 'Verify content is accessible to screen readers',
            type: 'accessibility',
            priority: 'high',
            steps: [
                { action: 'checkAriaLabels', params: {} },
                { action: 'checkHeadingStructure', params: {} },
                { action: 'checkAltTexts', params: {} }
            ],
            assertions: [
                { type: 'accessibility', description: 'All images should have alt text' },
                { type: 'accessibility', description: 'Heading structure should be logical' },
                { type: 'accessibility', description: 'Interactive elements should have ARIA labels' }
            ]
        });

        // Form accessibility test
        if (pageAnalysis.forms && pageAnalysis.forms.length > 0) {
            tests.push({
                id: 'a11y_form_labels',
                name: 'Form Label Association Test',
                description: 'Verify form fields have proper labels',
                type: 'accessibility',
                priority: 'high',
                steps: [
                    { action: 'checkFormLabels', params: {} }
                ],
                assertions: [
                    { type: 'accessibility', description: 'All form fields should have associated labels' }
                ]
            });
        }

        return tests;
    }

    /**
     * Generate performance tests
     */
    async generatePerformanceTests(pageAnalysis) {
        const tests = [];

        // Page load performance test
        tests.push({
            id: 'perf_page_load',
            name: 'Page Load Performance Test',
            description: 'Measure page load performance metrics',
            type: 'performance',
            priority: 'high',
            steps: [
                { action: 'measurePageLoad', params: {} },
                { action: 'collectPerformanceMetrics', params: {} }
            ],
            assertions: [
                { type: 'performance', description: 'Page should load within 3 seconds', threshold: 3000 },
                { type: 'performance', description: 'First Contentful Paint should be under 1.5 seconds', threshold: 1500 }
            ]
        });

        // Resource loading test
        tests.push({
            id: 'perf_resource_loading',
            name: 'Resource Loading Performance Test',
            description: 'Verify resources load efficiently',
            type: 'performance',
            priority: 'medium',
            steps: [
                { action: 'monitorResourceLoading', params: {} },
                { action: 'analyzeResourceSizes', params: {} }
            ],
            assertions: [
                { type: 'performance', description: 'No resources should take longer than 5 seconds to load' },
                { type: 'performance', description: 'Total page size should be under 2MB' }
            ]
        });

        return tests;
    }

    /**
     * Generate security tests
     */
    async generateSecurityTests(pageAnalysis) {
        const tests = [];

        // HTTPS test
        tests.push({
            id: 'security_https',
            name: 'HTTPS Security Test',
            description: 'Verify page uses HTTPS protocol',
            type: 'security',
            priority: 'high',
            steps: [
                { action: 'checkProtocol', params: {} }
            ],
            assertions: [
                { type: 'security', description: 'Page should use HTTPS protocol' }
            ]
        });

        // Content Security Policy test
        tests.push({
            id: 'security_csp',
            name: 'Content Security Policy Test',
            description: 'Verify CSP headers are present and configured',
            type: 'security',
            priority: 'medium',
            steps: [
                { action: 'checkSecurityHeaders', params: {} }
            ],
            assertions: [
                { type: 'security', description: 'CSP headers should be present' }
            ]
        });

        // Form security test
        if (pageAnalysis.forms && pageAnalysis.forms.length > 0) {
            tests.push({
                id: 'security_form_validation',
                name: 'Form Input Validation Test',
                description: 'Test form input validation and sanitization',
                type: 'security',
                priority: 'high',
                steps: [
                    { action: 'testXSSInputs', params: {} },
                    { action: 'testSQLInjectionInputs', params: {} }
                ],
                assertions: [
                    { type: 'security', description: 'Forms should reject malicious inputs' }
                ]
            });
        }

        return tests;
    }

    /**
     * Generate AI-powered tests
     */
    async generateAITests(pageAnalysis, objective) {
        if (!this.aiHelper || !this.aiHelper.isAIAvailable()) {
            return { type: 'ai_generated', count: 0, tests: [] };
        }

        try {
            const pageContent = JSON.stringify(pageAnalysis, null, 2);
            const aiScenarios = await this.aiHelper.generateTestScenarios(pageContent, objective);
            
            const tests = [];
            
            if (aiScenarios.scenarios) {
                for (const scenario of aiScenarios.scenarios) {
                    tests.push({
                        id: `ai_${scenario.scenario_name.toLowerCase().replace(/\s+/g, '_')}`,
                        name: scenario.scenario_name,
                        description: scenario.description,
                        type: 'ai_generated',
                        priority: scenario.priority,
                        testType: scenario.test_type,
                        steps: this.convertAIStepsToTestSteps(scenario.steps),
                        assertions: [
                            { type: 'functional', description: scenario.expected_results }
                        ],
                        aiGenerated: true
                    });
                }
            }

            return { type: 'ai_generated', count: tests.length, tests };
        } catch (error) {
            this.logger.warn('AI test generation failed', { error: error.message });
            return { type: 'ai_generated', count: 0, tests: [], error: error.message };
        }
    }



    /**
     * Generate button test
     */
    generateButtonTest(element) {
        return {
            id: `button_${element.id || element.text?.replace(/[^a-zA-Z0-9]/g, '_') || 'button'}`,
            name: `Button Test - ${element.text || 'Button'}`,
            description: 'Test button functionality and interaction',
            type: 'functional',
            priority: 'medium',
            steps: [
                { action: 'click', selector: element.selector || `button:has-text("${element.text}")`, description: `Click ${element.text || 'button'}` },
                { action: 'waitForResponse', params: {}, description: 'Wait for any response or action' }
            ],
            assertions: [
                { type: 'interaction', description: 'Button should be clickable and responsive' }
            ]
        };
    }

    /**
     * Generate search tests
     */
    generateSearchTests(searchElement) {
        const tests = [];
        
        // Basic search test
        tests.push({
            id: `search_basic_${searchElement.id || 'search'}`,
            name: 'Basic Search Test',
            description: 'Test basic search functionality',
            type: 'functional',
            priority: 'high',
            steps: [
                { action: 'fill', selector: searchElement.selector || 'input[type="search"]', value: 'test query', description: 'Enter search query' },
                { action: 'press', key: 'Enter', description: 'Submit search' },
                { action: 'waitForResults', params: {}, description: 'Wait for search results' }
            ],
            assertions: [
                { type: 'search', description: 'Search should return results' }
            ]
        });

        // Empty search test
        if (this.options.includeNegativeTests) {
            tests.push({
                id: `search_empty_${searchElement.id || 'search'}`,
                name: 'Empty Search Test',
                description: 'Test search behavior with empty query',
                type: 'functional',
                priority: 'medium',
                steps: [
                    { action: 'fill', selector: searchElement.selector || 'input[type="search"]', value: '', description: 'Enter empty search query' },
                    { action: 'press', key: 'Enter', description: 'Submit empty search' }
                ],
                assertions: [
                    { type: 'validation', description: 'Should handle empty search appropriately' }
                ]
            });
        }

        return tests;
    }

    /**
     * Generate required field test steps
     */
    generateRequiredFieldSteps(form) {
        const steps = [];
        
        // Try to submit form without filling required fields
        steps.push({
            action: 'click',
            selector: 'button[type="submit"], input[type="submit"]',
            description: 'Attempt to submit form without filling required fields'
        });
        
        // Check for validation messages
        steps.push({
            action: 'waitForSelector',
            selector: '.error, .invalid, [aria-invalid="true"]',
            description: 'Wait for validation error messages'
        });
        
        return steps;
    }

    /**
     * Generate form-specific tests
     */
    generateFormTests(form) {
        const tests = [];
        
        // Valid form submission test
        tests.push({
            id: `form_${form.index}_valid_submission`,
            name: `Form ${form.index} Valid Submission Test`,
            description: 'Test form submission with valid data',
            type: 'functional',
            priority: 'high',
            steps: this.generateFormSteps(form, 'valid'),
            assertions: [
                { type: 'functional', description: 'Form should submit successfully with valid data' }
            ]
        });

        // Invalid form submission test
        if (this.options.includeNegativeTests) {
            tests.push({
                id: `form_${form.index}_invalid_submission`,
                name: `Form ${form.index} Invalid Submission Test`,
                description: 'Test form validation with invalid data',
                type: 'functional',
                priority: 'medium',
                steps: this.generateFormSteps(form, 'invalid'),
                assertions: [
                    { type: 'functional', description: 'Form should show validation errors for invalid data' }
                ]
            });
        }

        // Required field validation test
        const requiredFields = form.fields.filter(field => field.required);
        if (requiredFields.length > 0) {
            tests.push({
                id: `form_${form.index}_required_fields`,
                name: `Form ${form.index} Required Fields Test`,
                description: 'Test required field validation',
                type: 'functional',
                priority: 'high',
                steps: this.generateRequiredFieldSteps(form),
                assertions: [
                    { type: 'functional', description: 'Required fields should show validation errors when empty' }
                ]
            });
        }

        return tests;
    }

    /**
     * Generate form test steps
     */
    generateFormSteps(form, dataType) {
        const steps = [];
        
        for (const field of form.fields) {
            const selector = field.id ? `#${field.id}` : field.name ? `[name="${field.name}"]` : `${field.tag}[type="${field.type}"]`;
            const value = this.generateTestData(field, dataType);
            
            if (value !== null) {
                steps.push({
                    action: field.tag === 'select' ? 'select' : 'fill',
                    selector,
                    value,
                    description: `${dataType === 'valid' ? 'Fill' : 'Enter invalid data in'} ${field.name || field.type} field`
                });
            }
        }
        
        // Add submit step
        steps.push({
            action: 'click',
            selector: 'button[type="submit"], input[type="submit"]',
            description: 'Submit the form'
        });
        
        return steps;
    }

    /**
     * Generate test data based on field type
     */
    generateTestData(field, dataType) {
        const validData = {
            'email': 'test@example.com',
            'password': 'SecurePass123!',
            'text': 'Test User',
            'tel': '+1234567890',
            'url': 'https://example.com',
            'number': '123',
            'date': '2024-01-01',
            'time': '12:00',
            'search': 'test query'
        };
        
        const invalidData = {
            'email': 'invalid-email',
            'password': '123',
            'text': '',
            'tel': 'invalid-phone',
            'url': 'not-a-url',
            'number': 'not-a-number',
            'date': 'invalid-date',
            'time': 'invalid-time',
            'search': ''
        };
        
        const dataMap = dataType === 'valid' ? validData : invalidData;
        return dataMap[field.type] || (dataType === 'valid' ? 'test value' : '');
    }

    /**
     * Convert AI-generated steps to test steps
     */
    convertAIStepsToTestSteps(aiSteps) {
        return aiSteps.map(step => {
            // Simple conversion - in practice, this would be more sophisticated
            const lowerStep = step.toLowerCase();
            
            if (lowerStep.includes('navigate') || lowerStep.includes('go to')) {
                return { action: 'navigate', description: step };
            } else if (lowerStep.includes('click')) {
                return { action: 'click', description: step };
            } else if (lowerStep.includes('fill') || lowerStep.includes('enter')) {
                return { action: 'fill', description: step };
            } else if (lowerStep.includes('verify') || lowerStep.includes('check')) {
                return { action: 'verify', description: step };
            } else {
                return { action: 'custom', description: step };
            }
        });
    }

    /**
     * Generate test suite summary
     */
    generateTestSuiteSummary(testSuite) {
        const summary = {
            totalTests: 0,
            testsByType: {},
            testsByPriority: { high: 0, medium: 0, low: 0 },
            coverage: {
                forms: testSuite.pageAnalysis.forms.length,
                links: testSuite.pageAnalysis.links.length,
                interactiveElements: testSuite.pageAnalysis.elements.interactive.length
            },
            recommendations: []
        };

        // Count tests by type and priority
        for (const [type, category] of Object.entries(testSuite.testCategories)) {
            summary.testsByType[type] = category.count;
            summary.totalTests += category.count;
            
            for (const test of category.tests) {
                if (test.priority) {
                    summary.testsByPriority[test.priority]++;
                }
            }
        }

        // Generate recommendations
        if (summary.testsByPriority.high < 5) {
            summary.recommendations.push('Consider adding more high-priority tests for critical functionality');
        }
        
        if (!testSuite.testCategories.accessibility || testSuite.testCategories.accessibility.count === 0) {
            summary.recommendations.push('Add accessibility tests to ensure compliance with WCAG guidelines');
        }
        
        if (!testSuite.testCategories.performance || testSuite.testCategories.performance.count === 0) {
            summary.recommendations.push('Include performance tests to monitor page load times and resource usage');
        }

        return summary;
    }

    /**
     * Initialize test templates
     */
    initializeTestTemplates() {
        return {
            functional: {
                navigation: {
                    steps: ['navigate', 'verify_page_load'],
                    assertions: ['url_matches', 'title_present']
                },
                form_submission: {
                    steps: ['fill_form', 'submit', 'verify_success'],
                    assertions: ['form_submitted', 'success_message_shown']
                }
            },
            ui: {
                responsive: {
                    steps: ['set_viewport', 'screenshot', 'compare'],
                    assertions: ['layout_adapts']
                }
            },
            accessibility: {
                keyboard_navigation: {
                    steps: ['tab_through_elements', 'verify_focus'],
                    assertions: ['all_elements_reachable']
                }
            }
        };
    }

    /**
     * Export test suite to various formats
     */
    exportTestSuite(testSuite, format = 'json') {
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(testSuite, null, 2);
            case 'playwright':
                return this.convertToPlaywrightTests(testSuite);
            case 'cypress':
                return this.convertToCypressTests(testSuite);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Convert to Playwright test format
     */
    convertToPlaywrightTests(testSuite) {
        let playwrightCode = `// Generated Playwright tests for ${testSuite.url}\n`;
        playwrightCode += `// Generated on: ${testSuite.timestamp}\n\n`;
        playwrightCode += `const { test, expect } = require('@playwright/test');\n\n`;

        for (const [categoryName, category] of Object.entries(testSuite.testCategories)) {
            playwrightCode += `// ${categoryName.toUpperCase()} TESTS\n`;
            
            for (const testCase of category.tests) {
                playwrightCode += `test('${testCase.name}', async ({ page }) => {\n`;
                playwrightCode += `  // ${testCase.description}\n`;
                
                for (const step of testCase.steps) {
                    playwrightCode += this.convertStepToPlaywright(step);
                }
                
                playwrightCode += `});\n\n`;
            }
        }

        return playwrightCode;
    }

    /**
     * Convert to Cypress test format
     */
    convertToCypressTests(testSuite) {
        let cypressCode = `// Generated Cypress tests for ${testSuite.url}\n`;
        cypressCode += `// Generated on: ${testSuite.timestamp}\n\n`;
        cypressCode += `describe('${testSuite.url}', () => {\n`;

        for (const [categoryName, category] of Object.entries(testSuite.testCategories)) {
            cypressCode += `  // ${categoryName.toUpperCase()} TESTS\n`;
            
            for (const testCase of category.tests) {
                cypressCode += `  it('${testCase.name}', () => {\n`;
                cypressCode += `    // ${testCase.description}\n`;
                
                for (const step of testCase.steps) {
                    cypressCode += this.convertStepToCypress(step);
                }
                
                cypressCode += `  });\n\n`;
            }
        }

        cypressCode += `});\n`;
        return cypressCode;
    }

    /**
     * Convert step to Cypress code
     */
    convertStepToCypress(step) {
        switch (step.action) {
            case 'navigate':
                return `    cy.visit('${step.url || step.params?.url}');\n`;
            case 'click':
                return `    cy.get('${step.selector}').click();\n`;
            case 'fill':
                return `    cy.get('${step.selector}').type('${step.value}');\n`;
            case 'screenshot':
                return `    cy.screenshot('${step.params?.name || 'screenshot'}');\n`;
            default:
                return `    // ${step.description || step.action}\n`;
        }
    }

    /**
     * Convert step to Playwright code
     */
    convertStepToPlaywright(step) {
        switch (step.action) {
            case 'navigate':
                return `  await page.goto('${step.url || step.params?.url}');\n`;
            case 'click':
                return `  await page.click('${step.selector}');\n`;
            case 'fill':
                return `  await page.fill('${step.selector}', '${step.value}');\n`;
            case 'screenshot':
                return `  await page.screenshot({ path: '${step.params?.name || 'screenshot'}.png' });\n`;
            default:
                return `  // ${step.description || step.action}\n`;
        }
    }

    /**
     * Get generation statistics
     */
    getGenerationStats() {
        return {
            totalTestsGenerated: this.generatedTests.size,
            patternsIdentified: this.testPatterns.size,
            aiEnabled: this.aiHelper && this.aiHelper.isAIAvailable(),
            supportedFormats: ['json', 'playwright', 'cypress']
        };
    }
}

module.exports = TestGenerator;