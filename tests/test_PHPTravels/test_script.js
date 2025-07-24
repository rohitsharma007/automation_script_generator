const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// PHPTravels Intelligent Test Generation Script
class PHPTravelsTestRunner {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = {
            testName: 'PHPTravels_Login_Test',
            url: 'https://www.phptravels.net/login',
            startTime: new Date().toISOString(),
            steps: [],
            elementDetection: [],
            screenshots: [],
            status: 'RUNNING'
        };
    }

    async initialize() {
        console.log('🚀 Initializing PHPTravels Test Runner...');
        this.browser = await chromium.launch({ headless: false });
        this.page = await this.browser.newPage();
        
        // Set viewport
        await this.page.setViewportSize({ width: 1280, height: 720 });
        
        console.log('✅ Browser initialized successfully');
    }

    async navigateToSite() {
        console.log('🌐 Navigating to PHPTravels login page...');
        try {
            await this.page.goto('https://www.phptravels.net/login', { waitUntil: 'networkidle' });
            await this.page.waitForTimeout(2000);
            
            this.testResults.steps.push({
                step: 1,
                action: 'Navigate to PHPTravels',
                status: 'PASSED',
                timestamp: new Date().toISOString()
            });
            
            console.log('✅ Successfully navigated to PHPTravels');
        } catch (error) {
            console.error('❌ Navigation failed:', error.message);
            this.testResults.steps.push({
                step: 1,
                action: 'Navigate to PHPTravels',
                status: 'FAILED',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async detectElements() {
        console.log('🔍 Detecting login elements...');
        const elements = [
            { name: 'email', selector: '#email', type: 'input' },
            { name: 'password', selector: '#password', type: 'input' },
            { name: 'loginButton', selector: '#login', type: 'button' }
        ];

        for (const element of elements) {
            try {
                const isVisible = await this.page.isVisible(element.selector);
                const isEnabled = await this.page.isEnabled(element.selector);
                
                this.testResults.elementDetection.push({
                    name: element.name,
                    selector: element.selector,
                    type: element.type,
                    detected: isVisible,
                    enabled: isEnabled,
                    confidence: isVisible && isEnabled ? 100 : 50
                });
                
                console.log(`${isVisible ? '✅' : '❌'} ${element.name}: ${element.selector}`);
            } catch (error) {
                console.error(`❌ Error detecting ${element.name}:`, error.message);
                this.testResults.elementDetection.push({
                    name: element.name,
                    selector: element.selector,
                    type: element.type,
                    detected: false,
                    enabled: false,
                    confidence: 0,
                    error: error.message
                });
            }
        }
    }

    async performLogin() {
        console.log('🔐 Performing login...');
        try {
            // Fill email
            await this.page.fill('#email', 'user@phptravels.com');
            await this.page.waitForTimeout(500);
            
            this.testResults.steps.push({
                step: 2,
                action: 'Fill email field',
                status: 'PASSED',
                timestamp: new Date().toISOString()
            });
            
            // Fill password
            await this.page.fill('#password', 'demouser');
            await this.page.waitForTimeout(500);
            
            this.testResults.steps.push({
                step: 3,
                action: 'Fill password field',
                status: 'PASSED',
                timestamp: new Date().toISOString()
            });
            
            // Take screenshot before login
            const beforeLoginPath = path.join(__dirname, 'screenshots', 'before-login.png');
            await this.page.screenshot({ path: beforeLoginPath });
            this.testResults.screenshots.push('before-login.png');
            
            // Click login button
            await this.page.click('#login');
            await this.page.waitForTimeout(3000);
            
            this.testResults.steps.push({
                step: 4,
                action: 'Click login button',
                status: 'PASSED',
                timestamp: new Date().toISOString()
            });
            
            // Take screenshot after login
            const afterLoginPath = path.join(__dirname, 'screenshots', 'after-login.png');
            await this.page.screenshot({ path: afterLoginPath });
            this.testResults.screenshots.push('after-login.png');
            
            console.log('✅ Login process completed');
            
        } catch (error) {
            console.error('❌ Login failed:', error.message);
            this.testResults.steps.push({
                step: 'login_process',
                action: 'Perform login',
                status: 'FAILED',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async verifyLoginResult() {
        console.log('🔍 Verifying login result...');
        try {
            const currentUrl = this.page.url();
            const isLoggedIn = !currentUrl.includes('/login') || await this.page.isVisible('.user-menu, .dashboard, .profile');
            
            this.testResults.steps.push({
                step: 5,
                action: 'Verify login success',
                status: isLoggedIn ? 'PASSED' : 'FAILED',
                details: {
                    currentUrl: currentUrl,
                    expectedRedirect: 'Away from login page',
                    actualResult: isLoggedIn ? 'Login successful' : 'Still on login page'
                },
                timestamp: new Date().toISOString()
            });
            
            console.log(`${isLoggedIn ? '✅' : '❌'} Login verification: ${isLoggedIn ? 'SUCCESS' : 'FAILED'}`);
            console.log(`Current URL: ${currentUrl}`);
            
        } catch (error) {
            console.error('❌ Login verification failed:', error.message);
            this.testResults.steps.push({
                step: 5,
                action: 'Verify login success',
                status: 'FAILED',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async generateReport() {
        console.log('📊 Generating test report...');
        
        this.testResults.endTime = new Date().toISOString();
        this.testResults.status = 'COMPLETED';
        
        const passedSteps = this.testResults.steps.filter(step => step.status === 'PASSED').length;
        const totalSteps = this.testResults.steps.length;
        const detectedElements = this.testResults.elementDetection.filter(el => el.detected).length;
        const totalElements = this.testResults.elementDetection.length;
        
        this.testResults.summary = {
            totalSteps: totalSteps,
            passedSteps: passedSteps,
            failedSteps: totalSteps - passedSteps,
            successRate: `${Math.round((passedSteps / totalSteps) * 100)}%`,
            elementDetectionRate: `${Math.round((detectedElements / totalElements) * 100)}%`,
            detectedElements: detectedElements,
            totalElements: totalElements
        };
        
        // Save execution log
        const logPath = path.join(__dirname, 'logs', 'execution.log');
        const logContent = `PHPTravels Test Execution Log\n` +
                          `Start Time: ${this.testResults.startTime}\n` +
                          `End Time: ${this.testResults.endTime}\n` +
                          `Status: ${this.testResults.status}\n` +
                          `Success Rate: ${this.testResults.summary.successRate}\n` +
                          `Element Detection: ${this.testResults.summary.elementDetectionRate}\n` +
                          `\nSteps Executed:\n` +
                          this.testResults.steps.map((step, index) => 
                              `${index + 1}. ${step.action}: ${step.status}`
                          ).join('\n');
        
        fs.writeFileSync(logPath, logContent);
        
        // Save detailed report
        const reportPath = path.join(__dirname, 'reports', 'test_analysis.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
        
        console.log('✅ Test report generated successfully');
        console.log(`📁 Log saved to: ${logPath}`);
        console.log(`📁 Report saved to: ${reportPath}`);
        
        // Display summary
        console.log('\n📊 TEST SUMMARY:');
        console.log(`🎯 Success Rate: ${this.testResults.summary.successRate}`);
        console.log(`🔍 Element Detection: ${this.testResults.summary.elementDetectionRate}`);
        console.log(`📸 Screenshots: ${this.testResults.screenshots.length} captured`);
    }

    async cleanup() {
        console.log('🧹 Cleaning up...');
        if (this.browser) {
            await this.browser.close();
        }
        console.log('✅ Cleanup completed');
    }

    async run() {
        try {
            await this.initialize();
            await this.navigateToSite();
            await this.detectElements();
            await this.performLogin();
            await this.verifyLoginResult();
            await this.generateReport();
        } catch (error) {
            console.error('❌ Test execution failed:', error.message);
            this.testResults.status = 'FAILED';
            this.testResults.error = error.message;
        } finally {
            await this.cleanup();
        }
    }
}

// Execute the test
if (require.main === module) {
    const testRunner = new PHPTravelsTestRunner();
    testRunner.run().then(() => {
        console.log('🏁 PHPTravels test execution completed');
        process.exit(0);
    }).catch((error) => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
}

module.exports = PHPTravelsTestRunner;