// Generated Playwright MCP (Multi-Context) Script
// Test Case ID: 12345
// Generated on: 2025-07-24 21:08:05

const { chromium, firefox, webkit } = require('playwright');

class PlaywrightMCPAutomation {
  constructor(config = {}) {
    this.testCaseId = config.testCaseId || 'Herokuapp';
    this.testFolder = `test_${this.testCaseId}`; // Simple folder name based on test case ID
    this.config = {
      browsers: ['chromium'], // Can test across multiple browsers
      headless: false,
      viewport: { width: 1280, height: 720 },
      timeout: 30000,
      ...config
    };
    this.contexts = [];
    this.pages = [];
    this.testResults = [];
    this.stepLogs = [];
  }
  
  async setup() {
    console.log('🎭 Setting up Multi-Context Playwright...');
    
    // Create test case folder structure
    const fs = require('fs');
    const path = require('path');
    
    // Always ensure the test folder exists (create if new, reuse if existing)
    if (!fs.existsSync(this.testFolder)) {
      fs.mkdirSync(this.testFolder, { recursive: true });
      console.log(`📁 Created new test folder: ${this.testFolder}`);
    } else {
      console.log(`📁 Reusing existing test folder: ${this.testFolder}`);
    }
    
    // Create subfolders for organization (will not overwrite existing)
    ['screenshots', 'logs', 'reports'].forEach(dir => {
      const dirPath = path.join(this.testFolder, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
    
    for (const browserType of this.config.browsers) {
      const browser = await this.launchBrowser(browserType);
      const context = await browser.newContext({
        viewport: this.config.viewport
        // Removed: video recording, HAR files, and tracing for performance
      });
      
      const page = await context.newPage();
      
      this.contexts.push({ browser, context, page, browserType });
      this.pages.push(page);
    }
  }
  
  async launchBrowser(browserType) {
    const browsers = { chromium, firefox, webkit };
    return await browsers[browserType].launch({
      headless: this.config.headless,
      slowMo: 500
    });
  }
  
  async runTest() {
    try {
      await this.setup();
      
      // Run test on all contexts simultaneously
      const testPromises = this.contexts.map(async (ctx, index) => {
        const { page, browserType } = ctx;
        console.log(`🚀 Running test on ${browserType}...`);
        
        try {
          const stepResults = await this.runTestSteps(browserType, page);
          
          console.log(`✅ ${browserType}: Test completed successfully`);
          return { browserType, status: 'passed', steps: stepResults };
          
        } catch (error) {
          console.error(`❌ ${browserType}: Test failed:`, error);
          
          return { browserType, status: 'failed', error: error.message };
        }
      });
      
      // Wait for all tests to complete
      const results = await Promise.allSettled(testPromises);
      
      // Store results for report generation
      this.testResults = results.map(r => r.status === 'fulfilled' ? r.value : { status: 'rejected', error: r.reason });
      
      // Generate test report
      this.generateReport(results);
      
    } finally {
      await this.cleanup();
    }
  }
  
  generateReport(results) {
    console.log('\n📊 Multi-Context Test Report:');
    console.log('='.repeat(40));
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { browserType, status } = result.value;
        console.log(`${browserType}: ${status.toUpperCase()}`);
      } else {
        console.log(`Context ${index}: REJECTED - ${result.reason}`);
      }
    });
  }
  
  async runTestSteps(browserType, page) {
    const testSteps = [
      { step: 1, action: 'Navigate to URL', value: 'https://parabank.parasoft.com/parabank/index.htm' },
      { step: 2, action: 'Fill username field', selector: 'input[name="username"]', value: 'john' },
      { step: 3, action: 'Fill password field', selector: 'input[name="password"]', value: 'demo' },
      { step: 4, action: 'Click login button', selector: 'input[value="Log In"]' },
      { step: 5, action: 'Verify successful login', selector: '.leftmenu' }
    ];

    const results = [];
    const stepLogs = [];
    
    for (const step of testSteps) {
      const startTime = new Date().toISOString();
      try {
        console.log(`${browserType}: Step ${step.step} - ${step.action}`);
        
        switch (step.step) {
          case 1:
            await page.goto(step.value);
            await page.waitForLoadState('networkidle');
            break;
          case 2:
            await page.fill(step.selector, step.value);
            break;
          case 3:
            await page.fill(step.selector, step.value);
            break;
          case 4:
            await page.click(step.selector);
            await page.waitForLoadState('networkidle');
            break;
          case 5:
            await page.waitForSelector(step.selector, { timeout: 10000 });
            break;
        }
        
        const endTime = new Date().toISOString();
        const stepResult = { 
          step: step.step, 
          action: step.action, 
          status: 'PASSED',
          startTime,
          endTime,
          duration: new Date(endTime) - new Date(startTime)
        };
        
        results.push(stepResult);
        stepLogs.push(`[${endTime}] ✅ Step ${step.step}: ${step.action} - PASSED`);
        
      } catch (error) {
        const endTime = new Date().toISOString();
        const stepResult = { 
          step: step.step, 
          action: step.action, 
          status: 'FAILED', 
          error: error.message,
          startTime,
          endTime,
          duration: new Date(endTime) - new Date(startTime)
        };
        
        results.push(stepResult);
        stepLogs.push(`[${endTime}] ❌ Step ${step.step}: ${step.action} - FAILED: ${error.message}`);
        
        // Save screenshot on failure
        const path = require('path');
        const screenshotPath = path.join(this.testFolder, 'screenshots', `${browserType}-step${step.step}-error.png`);
        await page.screenshot({ path: screenshotPath });
        stepLogs.push(`[${endTime}] 📸 Screenshot saved: ${screenshotPath}`);
        
        throw error;
      }
    }
    
    // Save step logs
    this.stepLogs = this.stepLogs.concat(stepLogs);
    return results;
  }

  async generateDetailedReport() {
    const fs = require('fs');
    const path = require('path');
    
    // Generate detailed test report
    const report = {
      testCaseId: this.testCaseId,
      testFolder: this.testFolder,
      timestamp: new Date().toISOString(),
      summary: {
        totalBrowsers: this.testResults.length,
        passed: this.testResults.filter(r => r.status === 'passed').length,
        failed: this.testResults.filter(r => r.status === 'failed').length
      },
      results: this.testResults,
      logs: this.stepLogs
    };
    
    // Save JSON report
    const reportPath = path.join(this.testFolder, 'reports', 'test_analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Save human-readable log file
    const logPath = path.join(this.testFolder, 'logs', 'execution.log');
    const logContent = [
      `Test Case ID: ${this.testCaseId}`,
      `Execution Time: ${new Date().toISOString()}`,
      `Test Folder: ${this.testFolder}`,
      '',
      '=== EXECUTION LOGS ===',
      ...this.stepLogs,
      '',
      '=== SUMMARY ===',
      `Total Browsers Tested: ${report.summary.totalBrowsers}`,
      `Passed: ${report.summary.passed}`,
      `Failed: ${report.summary.failed}`,
      '',
      '=== DETAILED RESULTS ===',
      ...this.testResults.map(result => {
        let resultText = `Browser: ${result.browserType} - Status: ${result.status.toUpperCase()}`;
        if (result.steps) {
          resultText += '\nSteps:';
          result.steps.forEach(step => {
            resultText += `\n  Step ${step.step}: ${step.action} - ${step.status}`;
            if (step.error) resultText += ` (Error: ${step.error})`;
          });
        }
        return resultText;
      })
    ].join('\n');
    
    fs.writeFileSync(logPath, logContent);
    
    // Copy the main script file to test folder for reference
    const scriptPath = path.join(this.testFolder, 'test_script.js');
    const currentScriptPath = __filename; // Current script file path
    fs.copyFileSync(currentScriptPath, scriptPath);
    
    console.log(`\n📊 Test Analysis Report Generated:`);
    console.log(`📁 Test Folder: ${this.testFolder}`);
    console.log(`📄 JSON Report: ${reportPath}`);
    console.log(`📝 Execution Log: ${logPath}`);
    console.log(`🎭 Test Script: ${scriptPath}`);
    
    return report;
  }

  async cleanup() {
    console.log('🧹 Cleaning up contexts...');
    
    for (const ctx of this.contexts) {
      try {
        await ctx.context.close();
        await ctx.browser.close();
      } catch (error) {
        console.error(`Error closing ${ctx.browserType}:`, error);
      }
    }
    
    // Generate final detailed report
    await this.generateDetailedReport();
  }
}

// Execute the MCP automation
(async () => {
  // Extract test case ID from sample.json if available
  let testCaseId = '12345'; // default
  try {
    const fs = require('fs');
    if (fs.existsSync('sample.json')) {
      const sampleData = JSON.parse(fs.readFileSync('sample.json', 'utf8'));
      testCaseId = sampleData.test_case_id || testCaseId;
    }
  } catch (error) {
    console.log('Using default test case ID');
  }
  
  const automation = new PlaywrightMCPAutomation({
    testCaseId: testCaseId,
    browsers: ['chromium'], // Add 'firefox', 'webkit' for cross-browser testing
    headless: false
  });
  
  await automation.runTest();
})();
