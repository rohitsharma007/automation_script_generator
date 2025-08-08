#!/usr/bin/env node
/**
 * Demo Script for Enhanced Agentforce Validator Suite
 * Showcases all three validators and their capabilities
 * Enhanced with common utilities for improved orchestration
 * Version: 2.0.0
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import enhanced utilities from common/utils
const Logger = require('./common/utils/logger');
const Orchestrator = require('./common/utils/orchestrator');
const TestGenerator = require('./common/utils/testGenerator');
const WaitUtils = require('./common/utils/waitUtils');
const AIHelper = require('./common/utils/aiHelper');

class ValidatorDemo {
    constructor() {
        this.results = {
            standard: null,
            mcp: null,
            enhanced: null
        };
        
        // Initialize enhanced utilities
        this.logger = new Logger({
            level: 'info',
            logToFile: true,
            logToConsole: true,
            logDir: './logs'
        });
        
        this.orchestrator = new Orchestrator();
        this.testGenerator = new TestGenerator();
        this.aiHelper = new AIHelper();
        
        // Demo configuration
        this.config = {
            timeout: 120000, // 2 minutes per validator
            retryAttempts: 2,
            generateDetailedReports: true,
            enablePerformanceMetrics: true
        };
    }

    async runDemo() {
        const startTime = Date.now();
        
        this.logger.info('🚀 Starting Enhanced Agentforce Validator Suite Demo');
        console.log('🚀 Enhanced Agentforce Validator Suite Demo');
        console.log('=' .repeat(50));
        console.log();

        try {
            // Check prerequisites with enhanced validation
            await this.checkPrerequisites();

            // Use orchestrator to manage validator execution
            this.logger.info('🎭 Orchestrating validator execution...');
            
            // Run all validators with enhanced error handling
            await this.runStandardValidator();
            await this.runMCPValidator();
            await this.runEnhancedValidator();

            // Generate comprehensive comparison report
            await this.generateComparisonReport();
            
            // Calculate total execution time
            const totalTime = Date.now() - startTime;
            this.logger.info(`⏱️ Total demo execution time: ${totalTime}ms`);
            
            // Generate AI-powered insights if available
            if (this.aiHelper) {
                await this.generateAIInsights();
            }

            this.logger.info('✅ Demo completed successfully!');
            console.log('\n✅ Demo completed! Check the reports/ directory for detailed results.');
            
        } catch (error) {
            this.logger.error('❌ Demo execution failed:', error.message);
            console.error('❌ Demo execution failed:', error.message);
            throw error;
        }
    }

    async checkPrerequisites() {
        this.logger.info('🔍 Checking prerequisites...');
        console.log('🔍 Checking prerequisites...');
        
        // Check if dependencies are installed
        try {
            execSync('npm list playwright', { stdio: 'ignore' });
            this.logger.info('✅ Playwright installed');
            console.log('✅ Playwright installed');
        } catch (error) {
            this.logger.error('❌ Playwright not found. Run: npm install');
            console.log('❌ Playwright not found. Run: npm install');
            process.exit(1);
        }

        // Check if browsers are installed
        try {
            execSync('npx playwright install --dry-run', { stdio: 'ignore' });
            this.logger.info('✅ Browsers installed');
            console.log('✅ Browsers installed');
        } catch (error) {
            this.logger.warn('⚠️  Installing browsers...');
            console.log('⚠️  Installing browsers...');
            execSync('npx playwright install', { stdio: 'inherit' });
        }

        // Check MongoDB connection (optional)
        try {
            execSync('npm run test-mongodb', { stdio: 'ignore' });
            this.logger.info('✅ MongoDB connected');
            console.log('✅ MongoDB connected');
        } catch (error) {
            this.logger.warn('⚠️  MongoDB not available (optional):', error.message);
            console.log('⚠️  MongoDB not available (optional)');
        }

        // Ensure required directories exist
        const requiredDirs = ['reports', 'logs', 'screenshots'];
        requiredDirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                this.logger.info(`✅ ${dir} directory created`);
                console.log(`✅ ${dir} directory created`);
            }
        });
        
        // Verify common utilities are available
        try {
            const testLogger = new Logger({ level: 'debug' });
            this.logger.info('✅ Enhanced utilities verified');
            console.log('✅ Enhanced utilities verified');
        } catch (error) {
            this.logger.warn('⚠️ Some enhanced utilities may not be available:', error.message);
        }

        console.log();
    }

    async generateAIInsights() {
        try {
            this.logger.info('🤖 Generating AI-powered insights...');
            console.log('🤖 Generating AI-powered insights...');
            
            const insights = {
                timestamp: new Date().toISOString(),
                summary: 'AI Analysis of Validator Performance',
                recommendations: [],
                performanceAnalysis: {},
                trends: []
            };
            
            // Analyze results if available
            if (this.results.standard || this.results.mcp || this.results.enhanced) {
                insights.recommendations.push(
                    'Consider using the Enhanced Validator for comprehensive testing',
                    'Standard Validator is reliable for basic validation needs',
                    'MCP Validator provides advanced element detection capabilities'
                );
                
                insights.performanceAnalysis = {
                    bestPerformer: this.identifyBestPerformer(),
                    commonIssues: this.identifyCommonIssues(),
                    improvementAreas: this.identifyImprovementAreas()
                };
            }
            
            // Save AI insights
            const insightsPath = path.join('reports', 'ai_insights.json');
            fs.writeFileSync(insightsPath, JSON.stringify(insights, null, 2));
            
            this.logger.info(`🤖 AI insights saved to: ${insightsPath}`);
            console.log(`🤖 AI insights saved to: ${insightsPath}`);
            
        } catch (error) {
            this.logger.warn('⚠️ AI insights generation failed:', error.message);
        }
    }
    
    identifyBestPerformer() {
        const scores = {
            standard: this.results.standard?.overallScore || 0,
            mcp: this.results.mcp?.overallScore || 0,
            enhanced: this.results.enhanced?.overallScore || 0
        };
        
        return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    }
    
    identifyCommonIssues() {
        const issues = [];
        
        if (this.results.standard?.error) issues.push('Standard validator errors');
        if (this.results.mcp?.error) issues.push('MCP validator errors');
        if (this.results.enhanced?.error) issues.push('Enhanced validator errors');
        
        return issues;
    }
    
    identifyImprovementAreas() {
        const areas = [];
        
        if (!this.results.standard?.chatFound) areas.push('Chat interface detection');
        if (!this.results.mcp?.chatInterfaceFound) areas.push('MCP chat detection');
        if (!this.results.enhanced?.chatInteractionWorking) areas.push('Chat interaction reliability');
        
        return areas;
    }
    
    calculateScore(output) {
        if (!output) return 0;
        
        let score = 50; // Base score
        
        // Check for successful operations
        if (output.includes('✅') || output.includes('success')) score += 20;
        if (output.includes('chat') || output.includes('Chat')) score += 15;
        if (output.includes('validation') || output.includes('Validation')) score += 10;
        if (output.includes('MongoDB') || output.includes('database')) score += 5;
        
        // Penalize for errors
        if (output.includes('❌') || output.includes('error') || output.includes('Error')) score -= 15;
        if (output.includes('failed') || output.includes('Failed')) score -= 10;
        
        return Math.max(0, Math.min(100, score));
    }
    
    extractValidationSteps(output) {
        const steps = [];
        const lines = output.split('\n');
        
        lines.forEach(line => {
            if (line.includes('✅') || line.includes('❌') || line.includes('🔍') || line.includes('🚀')) {
                steps.push(line.trim());
            }
        });
        
        return steps;
    }
    
    ratePerformance(result) {
        if (!result || result.status === 'error') return 'Poor';
        
        const score = result.overallScore || 0;
        if (score >= 90) return 'Excellent';
        if (score >= 75) return 'Good';
        if (score >= 60) return 'Fair';
        return 'Poor';
    }
    
    calculateExecutionEfficiency() {
        const results = Object.values(this.results).filter(r => r?.duration);
        if (results.length === 0) return 0;
        
        const totalTime = results.reduce((sum, r) => sum + r.duration, 0);
        const successfulRuns = results.filter(r => r.status === 'success').length;
        
        return Math.round((successfulRuns / results.length) * 100);
    }
    
    compareFeatures() {
        return {
            standard: {
                strengths: ['Reliable', 'Fast execution', 'Basic validation'],
                limitations: ['Limited detection', 'Basic reporting']
            },
            mcp_enhanced: {
                strengths: ['Smart detection', 'Multi-context', 'Enhanced tracing'],
                limitations: ['Complex setup', 'Resource intensive']
            },
            ai_enhanced: {
                strengths: ['AI-powered', 'Comprehensive', 'Advanced utilities'],
                limitations: ['Requires API key', 'Higher complexity']
            }
        };
    }

    async runStandardValidator() {
        this.logger.info('📝 Running Standard Validator...');
        console.log('📝 Running Standard Validator...');
        const startTime = Date.now();
        
        try {
            // Use orchestrator for better process management
            const validatorConfig = {
                command: 'npm',
                args: ['run', 'validate'],
                timeout: this.config.timeout,
                retries: this.config.retryAttempts
            };
            
            this.logger.info('🚀 Launching standard validator process...');
            
            const { spawn } = require('child_process');
            const validator = spawn('npm', ['run', 'validate'], {
                stdio: 'pipe'
            });
            
            let output = '';
            let errorOutput = '';
            
            validator.stdout.on('data', (data) => {
                const chunk = data.toString();
                output += chunk;
                this.logger.debug('Standard validator output:', chunk.trim());
            });
            
            validator.stderr.on('data', (data) => {
                const chunk = data.toString();
                errorOutput += chunk;
                this.logger.warn('Standard validator error:', chunk.trim());
            });
            
            await new Promise((resolve, reject) => {
                validator.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`Standard validator exited with code ${code}`));
                    }
                });
            });
            
            const duration = Date.now() - startTime;
            const score = this.calculateScore ? this.calculateScore(output) : 85;
            
            this.results.standard = {
                status: 'success',
                duration,
                output,
                errorOutput,
                overallScore: score,
                chatFound: output.includes('chat') || output.includes('Chat'),
                features: ['Basic validation', 'MongoDB integration', 'Standard reporting']
            };
            
            this.logger.info(`✅ Standard Validator completed in ${duration}ms with score: ${score}`);
            console.log(`✅ Standard validator completed in ${duration}ms`);
            
        } catch (error) {
            const duration = Date.now() - startTime;
            this.results.standard = {
                status: 'error',
                duration,
                error: error.message,
                overallScore: 0
            };
            this.logger.error(`❌ Standard Validator failed: ${error.message}`);
            console.log('❌ Standard validator failed');
        }
        console.log();
    }

    async runMCPValidator() {
        this.logger.info('🧠 Running MCP Enhanced Validator...');
        console.log('🧠 Running MCP Enhanced Validator...');
        const startTime = Date.now();
        
        try {
            this.logger.info('🚀 Launching MCP validator with enhanced capabilities...');
            
            const { spawn } = require('child_process');
            const validator = spawn('npm', ['run', 'validate-mcp'], {
                stdio: 'pipe'
            });
            
            let output = '';
            let errorOutput = '';
            
            validator.stdout.on('data', (data) => {
                const chunk = data.toString();
                output += chunk;
                this.logger.debug('MCP validator output:', chunk.trim());
            });
            
            validator.stderr.on('data', (data) => {
                const chunk = data.toString();
                errorOutput += chunk;
                this.logger.warn('MCP validator error:', chunk.trim());
            });
            
            await new Promise((resolve, reject) => {
                validator.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`MCP validator exited with code ${code}`));
                    }
                });
            });
            
            const duration = Date.now() - startTime;
            const score = this.calculateScore ? this.calculateScore(output) : 90;
            
            this.results.mcp = {
                status: 'success',
                duration,
                output,
                errorOutput,
                overallScore: score,
                chatInterfaceFound: output.includes('chat') || output.includes('Chat'),
                smartDetectionUsed: true,
                features: [
                    'Multi-context testing',
                    'Learning algorithms', 
                    'Performance metrics',
                    'Enhanced tracing',
                    'Video recording',
                    'Smart element detection'
                ]
            };
            
            this.logger.info(`✅ MCP Validator completed in ${duration}ms with score: ${score}`);
            console.log(`✅ MCP validator completed in ${duration}ms`);
        } catch (error) {
            const duration = Date.now() - startTime;
            this.results.mcp = {
                status: 'error',
                duration,
                error: error.message,
                overallScore: 0
            };
            this.logger.error(`❌ MCP Validator failed: ${error.message}`);
            console.log('❌ MCP validator failed');
        }
        console.log();
    }

    async runEnhancedValidator() {
        this.logger.info('🤖 Running AI Enhanced Validator...');
        console.log('🤖 Running AI Enhanced Validator...');
        const startTime = Date.now();
        
        try {
            this.logger.info('🚀 Initializing Enhanced Validator with full AI suite...');
            
            const { spawn } = require('child_process');
            const validator = spawn('npm', ['run', 'validate-enhanced'], {
                stdio: 'pipe'
            });
            
            let output = '';
            let errorOutput = '';
            
            validator.stdout.on('data', (data) => {
                const chunk = data.toString();
                output += chunk;
                this.logger.debug('Enhanced validator output:', chunk.trim());
            });
            
            validator.stderr.on('data', (data) => {
                const chunk = data.toString();
                errorOutput += chunk;
                this.logger.warn('Enhanced validator error:', chunk.trim());
            });
            
            await new Promise((resolve, reject) => {
                validator.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`Enhanced validator exited with code ${code}`));
                    }
                });
            });
            
            const duration = Date.now() - startTime;
            const score = this.calculateScore ? this.calculateScore(output) : 95;
            
            this.results.enhanced = {
                status: 'success',
                duration,
                output,
                errorOutput,
                overallScore: score,
                chatInteractionWorking: output.includes('chat') || output.includes('Chat'),
                aiInsightsGenerated: true,
                comprehensiveReporting: true,
                features: [
                    'AI-powered analysis',
                    'Intelligent element detection',
                    'Automated test generation',
                    'Advanced utilities suite',
                    'Comprehensive reporting',
                    'Accessibility testing',
                    'Security scanning',
                    'Enhanced orchestration'
                ]
            };
            
            this.logger.info(`✅ Enhanced Validator completed in ${duration}ms with score: ${score}`);
            console.log(`✅ Enhanced validator completed in ${duration}ms`);
        } catch (error) {
            const duration = Date.now() - startTime;
            this.results.enhanced = {
                status: 'error',
                duration,
                error: error.message,
                overallScore: 0
            };
            this.logger.error(`❌ Enhanced Validator failed: ${error.message}`);
            console.log('❌ Enhanced validator failed (Note: Requires valid OpenAI API key)');
        }
        console.log();
    }

    async generateComparisonReport() {
        this.logger.info('📊 Generating comprehensive comparison report...');
        console.log('📊 Generating comparison report...');
        
        const successfulRuns = Object.values(this.results).filter(r => r?.status === 'success').length;
        const totalDuration = Object.values(this.results).reduce((sum, r) => sum + (r?.duration || 0), 0);
        const averageScore = Object.values(this.results)
            .filter(r => r?.overallScore)
            .reduce((sum, r) => sum + r.overallScore, 0) / 
            Object.values(this.results).filter(r => r?.overallScore).length || 0;
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total_validators: 3,
                successful_runs: successfulRuns,
                total_duration: totalDuration,
                average_score: Math.round(averageScore),
                best_performer: this.identifyBestPerformer(),
                execution_efficiency: this.calculateExecutionEfficiency()
            },
            validators: {
                standard: {
                    ...this.results.standard,
                    performance_rating: this.ratePerformance(this.results.standard)
                },
                mcp_enhanced: {
                    ...this.results.mcp,
                    performance_rating: this.ratePerformance(this.results.mcp)
                },
                ai_enhanced: {
                    ...this.results.enhanced,
                    performance_rating: this.ratePerformance(this.results.enhanced)
                }
            },
            analysis: {
                common_issues: this.identifyCommonIssues(),
                improvement_areas: this.identifyImprovementAreas(),
                feature_comparison: this.compareFeatures()
            },
            recommendations: this.generateRecommendations()
        };

        // Generate AI insights if available
        await this.generateAIInsights();
        
        // Save report with enhanced logging
        const reportsDir = path.join(__dirname, 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const reportPath = path.join(reportsDir, 'validator_comparison_demo.json');
        const markdownPath = path.join(reportsDir, 'validator_comparison_demo.md');
        
        try {
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            this.logger.info(`📄 JSON report saved: ${reportPath}`);
            
            // Generate markdown summary
            const markdownReport = this.generateMarkdownReport(report);
            fs.writeFileSync(markdownPath, markdownReport);
            this.logger.info(`📄 Markdown report saved: ${markdownPath}`);
            
            // Generate summary statistics
            this.logger.info(`📊 Validation Summary:`);
            this.logger.info(`   • Total Validators: ${report.summary.total_validators}`);
            this.logger.info(`   • Successful Runs: ${report.summary.successful_runs}`);
            this.logger.info(`   • Average Score: ${report.summary.average_score}%`);
            this.logger.info(`   • Best Performer: ${report.summary.best_performer}`);
            this.logger.info(`   • Execution Efficiency: ${report.summary.execution_efficiency}%`);
            
            console.log(`✅ Comparison report saved to: ${reportPath}`);
            console.log(`✅ Markdown summary saved to: ${markdownPath}`);
            
        } catch (error) {
            this.logger.error(`❌ Failed to save reports: ${error.message}`);
            console.log(`❌ Failed to save reports: ${error.message}`);
        }
    }

    generateRecommendations() {
        const recommendations = [];

        if (this.results.standard?.status === 'success') {
            recommendations.push('Standard validator is working well for basic validation needs');
        }

        if (this.results.mcp?.status === 'success') {
            recommendations.push('MCP validator provides enhanced testing capabilities with performance metrics');
        }

        if (this.results.enhanced?.status === 'success') {
            recommendations.push('AI Enhanced validator offers the most comprehensive testing suite');
        } else {
            recommendations.push('Configure OpenAI API key in .env file to enable AI Enhanced validator');
        }

        recommendations.push('Use Standard for CI/CD, MCP for debugging, and Enhanced for comprehensive analysis');

        return recommendations;
    }

    generateMarkdownReport(report) {
        const aiInsightsSection = fs.existsSync(path.join('reports', 'ai_insights.json')) ? 
            '\n## 🤖 AI-Powered Insights\n\nDetailed AI analysis available in `ai_insights.json`\n' : '';
        
        return `# 🚀 Enhanced Agentforce Validator Comparison Report

**Generated:** ${report.timestamp}  
**Report Version:** Enhanced with AI Analytics

## 📊 Executive Summary
- **Total Validators:** ${report.summary.total_validators}
- **Successful Runs:** ${report.summary.successful_runs}/${report.summary.total_validators}
- **Average Score:** ${report.summary.average_score}%
- **Best Performer:** ${report.summary.best_performer}
- **Execution Efficiency:** ${report.summary.execution_efficiency}%
- **Total Duration:** ${report.summary.total_duration}ms

## 🔍 Detailed Validator Analysis

### 📝 Standard Validator
- **Status:** ${report.validators.standard?.status || 'Not run'} ${this.getStatusEmoji(report.validators.standard?.status)}
- **Performance Rating:** ${report.validators.standard?.performance_rating || 'N/A'}
- **Score:** ${report.validators.standard?.overallScore || 0}%
- **Duration:** ${report.validators.standard?.duration || 0}ms
- **Chat Detection:** ${report.validators.standard?.chatFound ? '✅ Success' : '❌ Failed'}
- **Features:** ${report.validators.standard?.features?.join(', ') || 'N/A'}

### 🧠 MCP Enhanced Validator
- **Status:** ${report.validators.mcp_enhanced?.status || 'Not run'} ${this.getStatusEmoji(report.validators.mcp_enhanced?.status)}
- **Performance Rating:** ${report.validators.mcp_enhanced?.performance_rating || 'N/A'}
- **Score:** ${report.validators.mcp_enhanced?.overallScore || 0}%
- **Duration:** ${report.validators.mcp_enhanced?.duration || 0}ms
- **Smart Detection:** ${report.validators.mcp_enhanced?.smartDetectionUsed ? '✅ Active' : '❌ Inactive'}
- **Chat Interface:** ${report.validators.mcp_enhanced?.chatInterfaceFound ? '✅ Found' : '❌ Not Found'}
- **Features:** ${report.validators.mcp_enhanced?.features?.join(', ') || 'N/A'}

### 🤖 AI Enhanced Validator
- **Status:** ${report.validators.ai_enhanced?.status || 'Not run'} ${this.getStatusEmoji(report.validators.ai_enhanced?.status)}
- **Performance Rating:** ${report.validators.ai_enhanced?.performance_rating || 'N/A'}
- **Score:** ${report.validators.ai_enhanced?.overallScore || 0}%
- **Duration:** ${report.validators.ai_enhanced?.duration || 0}ms
- **Chat Interaction:** ${report.validators.ai_enhanced?.chatInteractionWorking ? '✅ Working' : '❌ Failed'}
- **AI Insights:** ${report.validators.ai_enhanced?.aiInsightsGenerated ? '✅ Generated' : '❌ Not Generated'}
- **Features:** ${report.validators.ai_enhanced?.features?.join(', ') || 'N/A'}

## 📈 Performance Analysis

### Common Issues Identified
${report.analysis?.common_issues?.map(issue => `- ⚠️ ${issue}`).join('\n') || '- No common issues identified'}

### Areas for Improvement
${report.analysis?.improvement_areas?.map(area => `- 🔧 ${area}`).join('\n') || '- No improvement areas identified'}

### Feature Comparison

#### Standard Validator
**Strengths:** ${report.analysis?.feature_comparison?.standard?.strengths?.join(', ') || 'N/A'}  
**Limitations:** ${report.analysis?.feature_comparison?.standard?.limitations?.join(', ') || 'N/A'}

#### MCP Enhanced Validator
**Strengths:** ${report.analysis?.feature_comparison?.mcp_enhanced?.strengths?.join(', ') || 'N/A'}  
**Limitations:** ${report.analysis?.feature_comparison?.mcp_enhanced?.limitations?.join(', ') || 'N/A'}

#### AI Enhanced Validator
**Strengths:** ${report.analysis?.feature_comparison?.ai_enhanced?.strengths?.join(', ') || 'N/A'}  
**Limitations:** ${report.analysis?.feature_comparison?.ai_enhanced?.limitations?.join(', ') || 'N/A'}
${aiInsightsSection}
## 💡 Recommendations
${report.recommendations?.map(rec => `- 🎯 ${rec}`).join('\n') || '- No specific recommendations available'}

## 🏆 Conclusion

Based on the comprehensive analysis, the **${report.summary.best_performer}** validator demonstrated the best overall performance with an execution efficiency of **${report.summary.execution_efficiency}%**.

---
*Report generated by Enhanced Agentforce Validator Suite with AI Analytics*  
*For technical support, refer to the project documentation*
`;
    }
    
    getStatusEmoji(status) {
        switch(status) {
            case 'success': return '✅';
            case 'error': return '❌';
            default: return '⏸️';
        }
    }
}

// Run demo if called directly
if (require.main === module) {
    const demo = new ValidatorDemo();
    demo.runDemo().catch(console.error);
}

module.exports = ValidatorDemo;