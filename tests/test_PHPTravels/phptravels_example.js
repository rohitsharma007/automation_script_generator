#!/usr/bin/env node

/**
 * PHPTravels Login Test - Intelligent Test Generation Example
 * 
 * This example demonstrates how to use the intelligent test generation framework
 * with the PHPTravels demo site using the provided credentials.
 * 
 * Run with: node phptravels_example.js
 */

const { chromium } = require('playwright');
const IntelligentTestGenerator = require('./utils/intelligent_test_generator');
const APIIntegrationTester = require('./utils/api_integration_tester');
const SmartElementDetector = require('./utils/smart_element_detector');
const fs = require('fs');

class PHPTravelsTestDemo {
  constructor() {
    this.generator = new IntelligentTestGenerator();
    this.apiTester = new APIIntegrationTester();
    this.testCredentials = {
      url: 'https://www.phptravels.net/login',
      username: 'user@phptravels.com',
      password: 'demouser'
    };
    
    console.log('🌍 PHPTravels Intelligent Test Generation Demo');
    console.log('=' .repeat(50));
    console.log(`🔗 Testing URL: ${this.testCredentials.url}`);
    console.log(`👤 Username: ${this.testCredentials.username}`);
    console.log(`🔑 Password: ${this.testCredentials.password}`);
    console.log('=' .repeat(50));
  }

  async runDemo() {
    try {
      console.log('\n1️⃣  Generating Test from Natural Language...');
      const testCase = await this.generateNLPTest();
      
      console.log('\n2️⃣  Testing Smart Element Detection...');
      const detectionResults = await this.testSmartDetection();
      
      console.log('\n3️⃣  Executing Complete Login Flow...');
      const executionResults = await this.executeLoginFlow();
      
      console.log('\n4️⃣  Generating Page Objects...');
      const pageObjects = await this.generatePageObjects(detectionResults);
      
      console.log('\n5️⃣  Creating Complete Test Report...');
      await this.generateCompleteReport(testCase, detectionResults, executionResults, pageObjects);
      
      console.log('\n✅ PHPTravels demo completed successfully!');
      console.log('\n📁 Generated files:');
      console.log('   - phptravels_nlp_test.json');
      console.log('   - phptravels_smart_detection.json');
      console.log('   - phptravels_execution_results.json');
      console.log('   - phptravels_page_objects.json');
      console.log('   - phptravels_complete_report.json');
      
    } catch (error) {
      console.error('❌ Demo failed:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }

  async generateNLPTest() {
    console.log('   📝 Converting natural language to test steps...');
    
    const testDescription = `Navigate to ${this.testCredentials.url}. Fill username with '${this.testCredentials.username}'. Fill password with '${this.testCredentials.password}'. Click login button. Verify successful login to dashboard.`;
    
    const testCase = this.generator.generateCompleteTestCase(
      testDescription,
      {
        testCaseId: 'PHPTravels_Login_Test',
        testType: 'login',
        baseUrl: this.testCredentials.url,
        customData: {
          username: this.testCredentials.username,
          password: this.testCredentials.password
        }
      }
    );
    
    console.log(`   ✅ Generated ${testCase.test_steps.length} test steps`);
    console.log(`   📋 Test Case: ${testCase.test_case_id}`);
    
    // Save the generated test
    fs.writeFileSync('phptravels_nlp_test.json', JSON.stringify(testCase, null, 2));
    console.log('   💾 Saved NLP test to: phptravels_nlp_test.json');
    
    return testCase;
  }

  async testSmartDetection() {
    console.log('   🎯 Testing smart element detection on PHPTravels...');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const detector = new SmartElementDetector(page);
    
    const detectionResults = {
      site: this.testCredentials.url,
      timestamp: new Date().toISOString(),
      elements: {},
      performance: {}
    };
    
    try {
      const startTime = Date.now();
      await page.goto(this.testCredentials.url, { waitUntil: 'networkidle' });
      detectionResults.performance.pageLoadTime = Date.now() - startTime;
      
      // Test smart detection for login elements
      const elementTypes = ['username', 'password', 'loginButton'];
      
      for (const elementType of elementTypes) {
        try {
          const detectionStart = Date.now();
          const element = await detector.detectElement(elementType);
          const detectionTime = Date.now() - detectionStart;
          
          if (element) {
            const confidence = await detector.getConfidenceScore(element.element, elementType);
            detectionResults.elements[elementType] = {
              selector: element.selector,
              confidence: confidence,
              detected: true,
              detectionTime: detectionTime
            };
            console.log(`   ✅ ${elementType}: ${element.selector} (${confidence}% confidence, ${detectionTime}ms)`);
          } else {
            detectionResults.elements[elementType] = {
              detected: false,
              detectionTime: detectionTime
            };
            console.log(`   ❌ ${elementType}: Not detected (${detectionTime}ms)`);
          }
        } catch (error) {
          console.log(`   ⚠️  ${elementType}: Detection error - ${error.message}`);
          detectionResults.elements[elementType] = {
            detected: false,
            error: error.message
          };
        }
      }
      
      const detectedCount = Object.values(detectionResults.elements).filter(e => e.detected).length;
      console.log(`   📊 Smart Detection: ${detectedCount}/${elementTypes.length} elements found`);
      
      detectionResults.summary = {
        totalElements: elementTypes.length,
        detectedElements: detectedCount,
        successRate: Math.round((detectedCount / elementTypes.length) * 100)
      };
      
    } catch (error) {
      console.log(`   ❌ Smart detection failed: ${error.message}`);
      detectionResults.error = error.message;
    } finally {
      await browser.close();
    }
    
    // Save detection results
    fs.writeFileSync('phptravels_smart_detection.json', JSON.stringify(detectionResults, null, 2));
    console.log('   💾 Saved detection results to: phptravels_smart_detection.json');
    
    return detectionResults;
  }

  async executeLoginFlow() {
    console.log('   🔄 Executing complete login flow with smart detection...');
    
    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const page = await browser.newPage();
    const detector = new SmartElementDetector(page);
    
    const executionResults = {
      testCase: 'PHPTravels_Login_Flow',
      timestamp: new Date().toISOString(),
      steps: [],
      overall: {
        success: false,
        duration: 0,
        errors: []
      }
    };
    
    const startTime = Date.now();
    
    try {
      // Step 1: Navigate to login page
      console.log('   📍 Step 1: Navigating to login page...');
      await page.goto(this.testCredentials.url, { waitUntil: 'networkidle' });
      executionResults.steps.push({
        step: 1,
        action: 'navigate',
        url: this.testCredentials.url,
        success: true,
        timestamp: new Date().toISOString()
      });
      console.log('   ✅ Navigation successful');
      
      // Step 2: Detect and fill username
      console.log('   👤 Step 2: Detecting and filling username...');
      const usernameElement = await detector.detectElement('username');
      if (usernameElement) {
        await page.fill(usernameElement.selector, this.testCredentials.username);
        executionResults.steps.push({
          step: 2,
          action: 'fill_username',
          selector: usernameElement.selector,
          value: this.testCredentials.username,
          success: true,
          timestamp: new Date().toISOString()
        });
        console.log(`   ✅ Username filled using: ${usernameElement.selector}`);
      } else {
        throw new Error('Username field not detected');
      }
      
      // Step 3: Detect and fill password
      console.log('   🔑 Step 3: Detecting and filling password...');
      const passwordElement = await detector.detectElement('password');
      if (passwordElement) {
        await page.fill(passwordElement.selector, this.testCredentials.password);
        executionResults.steps.push({
          step: 3,
          action: 'fill_password',
          selector: passwordElement.selector,
          value: '***hidden***',
          success: true,
          timestamp: new Date().toISOString()
        });
        console.log(`   ✅ Password filled using: ${passwordElement.selector}`);
      } else {
        throw new Error('Password field not detected');
      }
      
      // Step 4: Detect and click login button
      console.log('   🔘 Step 4: Detecting and clicking login button...');
      const loginButton = await detector.detectElement('loginButton');
      if (loginButton) {
        await page.click(loginButton.selector);
        executionResults.steps.push({
          step: 4,
          action: 'click_login',
          selector: loginButton.selector,
          success: true,
          timestamp: new Date().toISOString()
        });
        console.log(`   ✅ Login button clicked using: ${loginButton.selector}`);
      } else {
        throw new Error('Login button not detected');
      }
      
      // Step 5: Wait for navigation and verify login
      console.log('   ⏳ Step 5: Verifying successful login...');
      try {
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // Check if URL changed (indicating successful login)
        const currentUrl = page.url();
        const loginSuccessful = !currentUrl.includes('/login') && currentUrl !== this.testCredentials.url;
        
        if (loginSuccessful) {
          executionResults.steps.push({
            step: 5,
            action: 'verify_login',
            currentUrl: currentUrl,
            success: true,
            timestamp: new Date().toISOString()
          });
          console.log(`   ✅ Login successful! Redirected to: ${currentUrl}`);
          executionResults.overall.success = true;
        } else {
          throw new Error(`Login failed - still on login page: ${currentUrl}`);
        }
      } catch (error) {
        executionResults.steps.push({
          step: 5,
          action: 'verify_login',
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`   ❌ Login verification failed: ${error.message}`);
      }
      
      // Take a screenshot of the final state
      await page.screenshot({ path: 'phptravels_final_state.png', fullPage: true });
      console.log('   📸 Screenshot saved: phptravels_final_state.png');
      
    } catch (error) {
      console.log(`   ❌ Execution failed: ${error.message}`);
      executionResults.overall.errors.push(error.message);
    } finally {
      executionResults.overall.duration = Date.now() - startTime;
      await browser.close();
    }
    
    const successfulSteps = executionResults.steps.filter(s => s.success).length;
    console.log(`   📊 Execution Summary: ${successfulSteps}/${executionResults.steps.length} steps successful`);
    console.log(`   ⏱️  Total Duration: ${executionResults.overall.duration}ms`);
    
    // Save execution results
    fs.writeFileSync('phptravels_execution_results.json', JSON.stringify(executionResults, null, 2));
    console.log('   💾 Saved execution results to: phptravels_execution_results.json');
    
    return executionResults;
  }

  async generatePageObjects(detectionResults) {
    console.log('   🏗️  Generating page objects from detected elements...');
    
    // Create page object from detected elements
    const detectedElements = {};
    Object.entries(detectionResults.elements).forEach(([type, element]) => {
      if (element.detected && element.selector) {
        detectedElements[type + 'Field'] = element.selector;
      }
    });
    
    // Add additional common elements for travel site
    const travelSiteElements = {
      ...detectedElements,
      logo: '.logo, .brand, [alt*="logo"]',
      navigationMenu: '.nav, .menu, .navigation',
      searchBox: '[type="search"], .search-input',
      bookingButton: '.book, .booking, [data-test*="book"]',
      userProfile: '.profile, .user, .account'
    };
    
    const pageObject = this.generator.generatePageObject('PHPTravelsLoginPage', travelSiteElements);
    
    console.log(`   ✅ Generated page object with ${Object.keys(pageObject.elements).length} elements`);
    console.log(`   🔧 Created ${Object.keys(pageObject.methods).length} methods`);
    
    // Save page objects
    const pageObjectsData = {
      generated_at: new Date().toISOString(),
      site: 'PHPTravels',
      page_objects: {
        PHPTravelsLoginPage: pageObject
      },
      detection_source: 'smart_element_detection',
      confidence_scores: Object.fromEntries(
        Object.entries(detectionResults.elements)
          .filter(([_, element]) => element.detected)
          .map(([type, element]) => [type, element.confidence])
      )
    };
    
    fs.writeFileSync('phptravels_page_objects.json', JSON.stringify(pageObjectsData, null, 2));
    console.log('   💾 Saved page objects to: phptravels_page_objects.json');
    
    return pageObjectsData;
  }

  async generateCompleteReport(testCase, detectionResults, executionResults, pageObjects) {
    console.log('   📊 Generating comprehensive test report...');
    
    const report = {
      test_session: {
        id: 'PHPTravels_Intelligent_Test_Session',
        timestamp: new Date().toISOString(),
        site: this.testCredentials.url,
        framework_version: '1.0.0'
      },
      natural_language_processing: {
        input_description: testCase.description,
        generated_steps: testCase.test_steps.length,
        test_data_generated: Object.keys(testCase.test_data || {}).length,
        success: true
      },
      smart_element_detection: {
        elements_tested: Object.keys(detectionResults.elements).length,
        elements_detected: Object.values(detectionResults.elements).filter(e => e.detected).length,
        success_rate: detectionResults.summary?.successRate || 0,
        average_confidence: Math.round(
          Object.values(detectionResults.elements)
            .filter(e => e.detected && e.confidence)
            .reduce((sum, e) => sum + e.confidence, 0) /
          Object.values(detectionResults.elements).filter(e => e.detected && e.confidence).length
        ) || 0
      },
      test_execution: {
        total_steps: executionResults.steps.length,
        successful_steps: executionResults.steps.filter(s => s.success).length,
        overall_success: executionResults.overall.success,
        duration_ms: executionResults.overall.duration,
        errors: executionResults.overall.errors
      },
      page_object_generation: {
        page_objects_created: Object.keys(pageObjects.page_objects).length,
        total_elements: Object.keys(pageObjects.page_objects.PHPTravelsLoginPage?.elements || {}).length,
        total_methods: Object.keys(pageObjects.page_objects.PHPTravelsLoginPage?.methods || {}).length
      },
      summary: {
        overall_success: executionResults.overall.success && detectionResults.summary?.successRate > 50,
        key_achievements: [
          'Natural language test generation',
          'Smart element detection without selectors',
          'Automated page object creation',
          'Complete login flow execution',
          'Comprehensive reporting'
        ],
        recommendations: [
          executionResults.overall.success ? 'Test execution successful - ready for production use' : 'Review failed steps and improve element detection',
          detectionResults.summary?.successRate > 80 ? 'Excellent element detection rate' : 'Consider training the detection model with more examples',
          'Integrate with CI/CD pipeline for automated testing'
        ]
      }
    };
    
    fs.writeFileSync('phptravels_complete_report.json', JSON.stringify(report, null, 2));
    console.log('   💾 Saved complete report to: phptravels_complete_report.json');
    
    // Display summary
    console.log('\n📋 Test Session Summary:');
    console.log(`   🎯 Overall Success: ${report.summary.overall_success ? 'YES' : 'NO'}`);
    console.log(`   📝 NLP Steps Generated: ${report.natural_language_processing.generated_steps}`);
    console.log(`   🔍 Element Detection Rate: ${report.smart_element_detection.success_rate}%`);
    console.log(`   ✅ Execution Success: ${report.test_execution.successful_steps}/${report.test_execution.total_steps} steps`);
    console.log(`   ⏱️  Total Duration: ${report.test_execution.duration_ms}ms`);
    console.log(`   🏗️  Page Objects: ${report.page_object_generation.page_objects_created} created`);
    
    return report;
  }
}

// Run the PHPTravels demo
if (require.main === module) {
  const demo = new PHPTravelsTestDemo();
  demo.runDemo().catch(error => {
    console.error('\n❌ PHPTravels demo failed:', error.message);
    process.exit(1);
  });
}

module.exports = PHPTravelsTestDemo;