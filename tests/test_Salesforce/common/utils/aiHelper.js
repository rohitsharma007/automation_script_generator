/**
 * AI Helper Utility for Enhanced Test Automation
 * Provides OpenAI integration for intelligent test generation and analysis
 */

const { OpenAI } = require('openai');
require('dotenv').config();

class AIHelper {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.model = process.env.AI_MODEL || 'gpt-4';
        this.temperature = parseFloat(process.env.AI_TEMPERATURE) || 0.3;
    }

    /**
     * Generate intelligent test scenarios based on page content
     */
    async generateTestScenarios(pageContent, testObjective) {
        try {
            const prompt = `
                Analyze the following web page content and generate comprehensive test scenarios for: ${testObjective}
                
                Page Content:
                ${pageContent}
                
                Generate test scenarios in JSON format with:
                - scenario_name
                - description
                - steps (array of actions)
                - expected_results
                - priority (high/medium/low)
                - test_type (functional/ui/integration)
            `;

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: this.temperature,
                max_tokens: 2000
            });

            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error('AI Test Scenario Generation Error:', error);
            return this.getFallbackScenarios(testObjective);
        }
    }

    /**
     * Analyze element for intelligent selector generation
     */
    async analyzeElement(elementInfo, context) {
        try {
            const prompt = `
                Analyze this web element and suggest the most reliable selector strategy:
                
                Element Info: ${JSON.stringify(elementInfo)}
                Context: ${context}
                
                Provide response in JSON format with:
                - recommended_selector
                - confidence_score (0-100)
                - alternative_selectors (array)
                - reasoning
            `;

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
                max_tokens: 500
            });

            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error('AI Element Analysis Error:', error);
            return this.getFallbackElementAnalysis(elementInfo);
        }
    }

    /**
     * Generate intelligent assertions based on expected behavior
     */
    async generateAssertions(testStep, expectedBehavior) {
        try {
            const prompt = `
                Generate comprehensive assertions for this test step:
                
                Test Step: ${testStep}
                Expected Behavior: ${expectedBehavior}
                
                Provide assertions in JSON format with:
                - assertion_type (visibility/text/attribute/state)
                - selector
                - expected_value
                - assertion_method
                - timeout
            `;

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
                max_tokens: 800
            });

            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error('AI Assertion Generation Error:', error);
            return this.getFallbackAssertions(testStep);
        }
    }

    /**
     * Analyze test failures and suggest fixes
     */
    async analyzeTestFailure(errorMessage, testContext, pageState) {
        try {
            const prompt = `
                Analyze this test failure and suggest solutions:
                
                Error: ${errorMessage}
                Test Context: ${JSON.stringify(testContext)}
                Page State: ${JSON.stringify(pageState)}
                
                Provide analysis in JSON format with:
                - root_cause
                - suggested_fixes (array)
                - confidence_level
                - alternative_approaches
            `;

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 1000
            });

            return JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error('AI Failure Analysis Error:', error);
            return this.getFallbackFailureAnalysis(errorMessage);
        }
    }

    /**
     * Fallback methods for when AI is unavailable
     */
    getFallbackScenarios(testObjective) {
        return {
            scenarios: [
                {
                    scenario_name: `Basic ${testObjective} Test`,
                    description: `Standard test scenario for ${testObjective}`,
                    steps: ['Navigate to page', 'Perform action', 'Verify result'],
                    expected_results: 'Action completes successfully',
                    priority: 'high',
                    test_type: 'functional'
                }
            ]
        };
    }

    getFallbackElementAnalysis(elementInfo) {
        return {
            recommended_selector: elementInfo.id ? `#${elementInfo.id}` : elementInfo.className ? `.${elementInfo.className}` : elementInfo.tagName,
            confidence_score: 60,
            alternative_selectors: [elementInfo.xpath, elementInfo.cssSelector],
            reasoning: 'Fallback selector based on available attributes'
        };
    }

    getFallbackAssertions(testStep) {
        return {
            assertions: [
                {
                    assertion_type: 'visibility',
                    selector: 'body',
                    expected_value: true,
                    assertion_method: 'toBeVisible',
                    timeout: 5000
                }
            ]
        };
    }

    getFallbackFailureAnalysis(errorMessage) {
        return {
            root_cause: 'Unknown error occurred',
            suggested_fixes: ['Retry the operation', 'Check element selectors', 'Verify page load state'],
            confidence_level: 'low',
            alternative_approaches: ['Use different selector strategy', 'Add explicit waits']
        };
    }

    /**
     * Check if AI is available and configured
     */
    isAIAvailable() {
        return !!(process.env.OPENAI_API_KEY && this.openai);
    }
}

module.exports = AIHelper;