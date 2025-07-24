#!/usr/bin/env node

/**
 * Quick Start Example - Intelligent Test Generation Framework
 * 
 * This script demonstrates the key features of our intelligent test generation system.
 * Run with: node quick_start_example.js
 */

const { chromium } = require('playwright');
const IntelligentTestGenerator = require('./utils/intelligent_test_generator');
const APIIntegrationTester = require('./utils/api_integration_tester');
const SmartElementDetector = require('./utils/smart_element_detector');
const fs = require('fs');

class QuickStartDemo {
  constructor() {
    this.generator = new IntelligentTestGenerator();
    this.apiTester = new APIIntegrationTester();
    console.log('🚀 Intelligent Test Generation Framework - Quick Start Demo');
    console.log('=' .repeat(60));
  }

  async runDemo() {
    try {
      console.log('\n1️⃣  Testing Natural Language Processing...');
      await this.demoNLP();
      
      console.log('\n2️⃣  Testing Page Object Generation...');
      await this.demoPageObjects();
      
      console.log('\n3️⃣  Testing API Integration...');
      await this.demoAPITesting();
      
      console.log('\n4️⃣  Testing Smart Element Detection...');
      await this.demoSmartDetection();
      
      console.log('\n5️⃣  Testing Complete Workflow...');
      await this.demoCompleteWorkflow();
      
      console.log('\n✅ Demo completed successfully!');
      console.log('\n📁 Check the following generated files:');
      console.log('   - quick_start_nlp_test.json');
      console.log('   - quick_start_page_objects.json');
      console.log('   - quick_start_api_results.json');
      console.log('   - quick_start_smart_detection.json');
      console.log('   - quick_start_complete_report.json');
      
    } catch (error) {
      console.error('❌ Demo failed:', error.message);
    }
  }

  async demoNLP() {
    console.log('   📝 Converting English to test steps...');
    
    const testDescription = "Navigate to https://www.saucedemo.com. Fill username with 'standard_user'. Fill password with 'secret_sauce'. Click login button. Verify successful login.";
    
    const testCase = this.generator.generateCompleteTestCase(
      testDescription,
      {
        testCaseId: 'QuickStart_SauceDemo',
        testType: 'login',
        baseUrl: 'https://www.saucedemo.com'
      }
    );
    
    console.log(`   ✅ Generated ${testCase.test_steps.length} test steps from natural language`);
    console.log(`   📋 Test Case ID: ${testCase.test_case_id}`);
    
    // Save the generated test
    fs.writeFileSync('quick_start_nlp_test.json', JSON.stringify(testCase, null, 2));
    console.log('   💾 Saved to: quick_start_nlp_test.json');
    
    return testCase;
  }

  async demoPageObjects() {
    console.log('   🏗️  Auto-generating page objects...');
    
    // Simulate discovered elements from a login page
    const loginElements = {
      usernameField: '#user-name',
      passwordField: '#password',
      loginButton: '#login-button',
      errorMessage: '[data-test="error"]',
      logo: '.login_logo'
    };
    
    const pageObject = this.generator.generatePageObject('LoginPage', loginElements);
    
    console.log(`   ✅ Generated page object with ${Object.keys(pageObject.elements).length} elements`);
    console.log(`   🔧 Created ${Object.keys(pageObject.methods).length} methods`);
    
    // Export page objects
    this.generator.exportPageObjects('quick_start_page_objects.json');
    console.log('   💾 Saved to: quick_start_page_objects.json');
    
    return pageObject;
  }

  async demoAPITesting() {
    console.log('   🌐 Testing API integration...');
    
    const apiTests = [
      {
        step: 1,
        action: 'API Request',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/users/1',
        expectedStatus: 200,
        validation: [
          { type: 'json_path', path: 'name', expected: 'not_empty' },
          { type: 'json_path', path: 'email', expected: 'contains', value: '@' },
          { type: 'response_time', maxTime: 2000 }
        ]
      },
      {
        step: 2,
        action: 'API Request',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        expectedStatus: 200,
        validation: [
          { type: 'json_path', path: 'title', expected: 'not_empty' },
          { type: 'json_path', path: 'userId', expected: 1 }
        ]
      }
    ];
    
    let passedTests = 0;
    
    for (const test of apiTests) {
      try {
        const result = await this.apiTester.executeAPIRequest(test);
        if (result.passed) {
          passedTests++;
          console.log(`   ✅ API Test ${test.step}: PASSED (${result.responseTime}ms)`);
        } else {
          console.log(`   ❌ API Test ${test.step}: FAILED`);
        }
      } catch (error) {
        console.log(`   ❌ API Test ${test.step}: ERROR - ${error.message}`);
      }
    }
    
    console.log(`   📊 API Tests: ${passedTests}/${apiTests.length} passed`);
    
    // Save API results
    this.apiTester.saveAPIResults('quick_start_api_results.json');
    console.log('   💾 Saved to: quick_start_api_results.json');
    
    return { total: apiTests.length, passed: passedTests };
  }

  async demoSmartDetection() {
    console.log('   🎯 Testing smart element detection...');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const detector = new SmartElementDetector(page);
    
    try {
      // Test on a simple login page
      await page.goto('https://the-internet.herokuapp.com/login');
      
      const detectionResults = {
        site: 'https://the-internet.herokuapp.com/login',
        timestamp: new Date().toISOString(),
        elements: {}
      };
      
      // Test smart detection for common elements
      const elementTypes = ['username', 'password', 'loginButton'];
      
      for (const elementType of elementTypes) {
        try {
          const element = await detector.detectElement(elementType);
          if (element) {
            const confidence = await detector.getConfidenceScore(element.element, elementType);
            detectionResults.elements[elementType] = {
              selector: element.selector,
              confidence: confidence,
              detected: true
            };
            console.log(`   ✅ ${elementType}: ${element.selector} (${confidence}% confidence)`);
          } else {
            detectionResults.elements[elementType] = {
              detected: false
            };
            console.log(`   ❌ ${elementType}: Not detected`);
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
      
      // Save detection results
      fs.writeFileSync('quick_start_smart_detection.json', JSON.stringify(detectionResults, null, 2));
      console.log('   💾 Saved to: quick_start_smart_detection.json');
      
    } catch (error) {
      console.log(`   ❌ Smart detection failed: ${error.message}`);
    } finally {
      await browser.close();
    }
  }

  async demoCompleteWorkflow() {
    console.log('   🔄 Testing complete intelligent workflow...');
    
    // Generate a complete test case
    const workflowDescription = "Navigate to demo site. Login with credentials. Verify dashboard. Check user profile via API.";
    
    const completeTest = this.generator.generateCompleteTestCase(
      workflowDescription,
      {
        testCaseId: 'QuickStart_Complete_Workflow',
        testType: 'login'
      }
    );
    
    // Simulate API validation
    const apiValidation = {
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users/1',
      validation: [
        { type: 'json_path', path: 'name', expected: 'not_empty' }
      ]
    };
    
    let apiResult;
    try {
      apiResult = await this.apiTester.executeAPIRequest({
        step: 1,
        action: 'API Request',
        ...apiValidation,
        expectedStatus: 200
      });
    } catch (error) {
      apiResult = { passed: false, error: error.message };
    }
    
    const workflowReport = {
      timestamp: new Date().toISOString(),
      testCase: completeTest,
      execution: {
        uiSteps: completeTest.test_steps.length,
        apiValidation: apiResult.passed,
        overallSuccess: apiResult.passed
      },
      features: {
        nlpProcessing: true,
        pageObjectGeneration: true,
        apiIntegration: true,
        smartDetection: true
      }
    };
    
    console.log(`   ✅ Generated ${completeTest.test_steps.length} UI steps from natural language`);
    console.log(`   ${apiResult.passed ? '✅' : '❌'} API validation: ${apiResult.passed ? 'PASSED' : 'FAILED'}`);
    console.log(`   🎯 Overall workflow: ${workflowReport.execution.overallSuccess ? 'SUCCESS' : 'FAILED'}`);
    
    // Save complete workflow report
    fs.writeFileSync('quick_start_complete_report.json', JSON.stringify(workflowReport, null, 2));
    console.log('   💾 Saved to: quick_start_complete_report.json');
    
    return workflowReport;
  }
}

// Run the demo
if (require.main === module) {
  const demo = new QuickStartDemo();
  demo.runDemo().catch(error => {
    console.error('\n❌ Demo failed:', error.message);
    process.exit(1);
  });
}

module.exports = QuickStartDemo;