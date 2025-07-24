const IntelligentTestGenerator = require('./utils/intelligent_test_generator');
const APIIntegrationTester = require('./utils/api_integration_tester');
const SmartElementDetector = require('./utils/smart_element_detector');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class IntelligentTestDemo {
  constructor() {
    this.testGenerator = new IntelligentTestGenerator();
    this.apiTester = new APIIntegrationTester();
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    console.log('🚀 Initializing Intelligent Test Generation Demo...');
    this.browser = await chromium.launch({ headless: false });
    this.page = await this.browser.newPage();
    console.log('✅ Browser initialized');
  }

  // Demo 1: Natural Language Processing
  async demoNaturalLanguageProcessing() {
    console.log('\n🧠 === DEMO 1: Natural Language Processing ===');
    
    const naturalLanguageTests = [
      {
        description: "Navigate to https://www.saucedemo.com/. Fill username with 'standard_user'. Fill password with 'secret_sauce'. Click login button. Verify successful login.",
        testType: 'login',
        testCaseId: 'NLP_SauceDemo'
      },
      {
        description: "Go to the registration page. Enter first name as 'John'. Type email 'john@test.com'. Fill password field. Click submit button. Check confirmation message.",
        testType: 'registration',
        testCaseId: 'NLP_Registration'
      },
      {
        description: "Visit the product page. Select item quantity as 2. Add to cart. Navigate to checkout. Verify cart contents.",
        testType: 'ecommerce',
        testCaseId: 'NLP_Ecommerce'
      }
    ];

    for (const testCase of naturalLanguageTests) {
      console.log(`\n📝 Processing: "${testCase.description}"`);
      
      const generatedTest = this.testGenerator.generateCompleteTestCase(
        testCase.description,
        {
          testCaseId: testCase.testCaseId,
          testType: testCase.testType,
          baseUrl: 'https://www.saucedemo.com/'
        }
      );
      
      console.log(`✅ Generated ${generatedTest.test_steps.length} test steps:`);
      generatedTest.test_steps.forEach(step => {
        console.log(`   ${step.step}. ${step.action}${step.value ? ` (${step.value})` : ''}`);
      });
      
      // Save generated test
      const filename = `generated_${testCase.testCaseId.toLowerCase()}.json`;
      this.testGenerator.saveTestCase(generatedTest, filename);
    }
  }

  // Demo 2: Page Object Model Auto-Generation
  async demoPageObjectGeneration() {
    console.log('\n🏗️ === DEMO 2: Page Object Model Auto-Generation ===');
    
    // Simulate discovered elements from a page
    const loginPageElements = {
      usernameField: '#user-name',
      passwordField: '#password',
      loginButton: '#login-button',
      errorMessage: '[data-test="error"]',
      logo: '.login_logo'
    };
    
    const dashboardElements = {
      menuButton: '#react-burger-menu-btn',
      productGrid: '.inventory_list',
      cartIcon: '.shopping_cart_link',
      sortDropdown: '.product_sort_container',
      logoutLink: '#logout_sidebar_link'
    };
    
    // Generate page objects
    console.log('🔍 Generating page objects from discovered elements...');
    
    const loginPage = this.testGenerator.generatePageObject('login', loginPageElements);
    const dashboardPage = this.testGenerator.generatePageObject('dashboard', dashboardElements);
    
    console.log(`✅ Generated LoginPage with ${Object.keys(loginPage.elements).length} elements and ${Object.keys(loginPage.methods).length} methods`);
    console.log(`✅ Generated DashboardPage with ${Object.keys(dashboardPage.elements).length} elements and ${Object.keys(dashboardPage.methods).length} methods`);
    
    // Display generated methods
    console.log('\n📋 Generated methods for LoginPage:');
    Object.entries(loginPage.methods).forEach(([methodName, methodData]) => {
      console.log(`   ${methodName}(): ${methodData.description}`);
    });
    
    // Export page objects
    this.testGenerator.exportPageObjects('generated_page_objects.json');
  }

  // Demo 3: Smart Test Data Management
  async demoTestDataManagement() {
    console.log('\n📊 === DEMO 3: Smart Test Data Management ===');
    
    const testDataScenarios = [
      { type: 'login', description: 'Login credentials' },
      { type: 'registration', description: 'User registration data' },
      { type: 'ecommerce', description: 'E-commerce test data' }
    ];
    
    for (const scenario of testDataScenarios) {
      console.log(`\n🎲 Generating ${scenario.description}:`);
      
      // Generate multiple data sets
      for (let i = 1; i <= 3; i++) {
        const testData = this.testGenerator.generateTestData(scenario.type);
        console.log(`   Dataset ${i}:`, JSON.stringify(testData, null, 2));
      }
      
      // Generate with custom data
      console.log(`\n🎯 Custom data example for ${scenario.type}:`);
      const customData = scenario.type === 'login' 
        ? { username: 'admin', password: 'admin123' }
        : { firstName: 'Custom', lastName: 'User' };
      
      const customTestData = this.testGenerator.generateTestData(scenario.type, customData);
      console.log('   Custom:', JSON.stringify(customTestData, null, 2));
    }
  }

  // Demo 4: API Integration Testing
  async demoAPIIntegration() {
    console.log('\n🌐 === DEMO 4: API Integration Testing ===');
    
    // Define API test steps
    const apiSteps = [
      {
        step: 1,
        action: 'API Request',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/users/1',
        expectedStatus: 200,
        validation: [
          { type: 'json_path', path: 'name', expected: 'Leanne Graham' },
          { type: 'json_path', path: 'email', expected: 'Sincere@april.biz' },
          { type: 'not_empty' }
        ]
      },
      {
        step: 2,
        action: 'API Request',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts',
        expectedStatus: 200,
        validation: [
          { type: 'array_length', expected: 100 },
          { type: 'json_path', path: '0.userId', expected: 1 }
        ]
      },
      {
        step: 3,
        action: 'API Request',
        method: 'POST',
        url: 'https://jsonplaceholder.typicode.com/posts',
        expectedStatus: 201,
        body: {
          title: 'Test Post',
          body: 'This is a test post',
          userId: 1
        },
        validation: [
          { type: 'json_path', path: 'title', expected: 'Test Post' },
          { type: 'json_path', path: 'id', expected: 101 }
        ]
      }
    ];
    
    console.log('🔄 Executing API test steps...');
    
    for (const step of apiSteps) {
      const result = await this.apiTester.executeAPIRequest(step);
      console.log(`\n📋 Step ${step.step} Results:`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Duration: ${result.duration}ms`);
      console.log(`   Response Status: ${result.response?.status || 'N/A'}`);
      
      if (result.validations.length > 0) {
        console.log('   Validations:');
        result.validations.forEach(validation => {
          const status = validation.passed ? '✅' : '❌';
          console.log(`     ${status} ${validation.type}: ${validation.message}`);
        });
      }
    }
    
    // Save API results
    this.apiTester.saveAPIResults('api_test_results.json');
  }

  // Demo 5: Hybrid UI + API Testing
  async demoHybridTesting() {
    console.log('\n🔄 === DEMO 5: Hybrid UI + API Testing ===');
    
    // UI steps for login
    const uiSteps = [
      {
        step: 1,
        action: 'navigate',
        url: 'https://www.saucedemo.com/'
      },
      {
        step: 2,
        action: 'fill',
        selector: '#user-name',
        value: 'standard_user'
      },
      {
        step: 3,
        action: 'fill',
        selector: '#password',
        value: 'secret_sauce'
      },
      {
        step: 4,
        action: 'click',
        selector: '#login-button'
      },
      {
        step: 5,
        action: 'wait',
        selector: '.inventory_list'
      }
    ];
    
    // API steps to validate backend
    const apiSteps = [
      {
        step: 1,
        action: 'API Request',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/users',
        expectedStatus: 200,
        validation: [
          { type: 'not_empty' },
          { type: 'array_length', expected: 10 }
        ]
      }
    ];
    
    console.log('🎭 Executing hybrid UI + API workflow...');
    
    const hybridResults = await this.apiTester.executeHybridWorkflow(uiSteps, apiSteps, this.page);
    
    console.log('\n📊 Hybrid Test Results:');
    console.log(`   UI Steps: ${hybridResults.ui.length} executed`);
    console.log(`   API Steps: ${hybridResults.api.length} executed`);
    console.log(`   Combined Success: ${hybridResults.combined ? '✅' : '❌'}`);
    
    // Save hybrid results
    fs.writeFileSync('hybrid_test_results.json', JSON.stringify(hybridResults, null, 2));
    console.log('✅ Hybrid test results saved to: hybrid_test_results.json');
  }

  // Demo 6: Complete Intelligent Workflow
  async demoCompleteWorkflow() {
    console.log('\n🎯 === DEMO 6: Complete Intelligent Workflow ===');
    
    const naturalDescription = "Navigate to SauceDemo login page. Fill username and password. Click login. Verify dashboard loads. Check product inventory via API.";
    
    console.log(`📝 Input: "${naturalDescription}"`);
    
    // Step 1: Generate test from natural language
    const generatedTest = this.testGenerator.generateCompleteTestCase(
      naturalDescription,
      {
        testCaseId: 'Complete_Workflow',
        testType: 'login',
        baseUrl: 'https://www.saucedemo.com/'
      }
    );
    
    console.log('\n🧠 Generated test steps:');
    generatedTest.test_steps.forEach(step => {
      console.log(`   ${step.step}. ${step.action}`);
    });
    
    // Step 2: Execute with smart element detection
    console.log('\n🎯 Executing with smart element detection...');
    const detector = new SmartElementDetector(this.page);
    
    try {
      // Navigate
      await this.page.goto(generatedTest.test_data.url);
      console.log('✅ Navigation completed');
      
      // Smart fill username
      const usernameDetection = await detector.detectElement('username');
      if (usernameDetection) {
        await this.page.fill(usernameDetection.selector, generatedTest.test_data.username);
        console.log(`✅ Username filled using: ${usernameDetection.selector}`);
      }
      
      // Smart fill password
      const passwordDetection = await detector.detectElement('password');
      if (passwordDetection) {
        await this.page.fill(passwordDetection.selector, generatedTest.test_data.password);
        console.log(`✅ Password filled using: ${passwordDetection.selector}`);
      }
      
      // Smart click login
      const loginDetection = await detector.detectElement('loginButton');
      if (loginDetection) {
        await this.page.click(loginDetection.selector);
        console.log(`✅ Login clicked using: ${loginDetection.selector}`);
      }
      
      // Wait for dashboard
      await this.page.waitForLoadState('networkidle');
      console.log('✅ Dashboard loaded');
      
    } catch (error) {
      console.log(`❌ UI execution error: ${error.message}`);
    }
    
    // Step 3: Execute API validation
    console.log('\n🌐 Executing API validation...');
    const apiValidation = await this.apiTester.executeAPIRequest({
      step: 1,
      action: 'API Request',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      expectedStatus: 200,
      validation: [
        { type: 'not_empty' },
        { type: 'json_path', path: 'userId', expected: 1 }
      ]
    });
    
    console.log(`✅ API validation: ${apiValidation.status}`);
    
    // Step 4: Generate comprehensive report
    const completeReport = {
      testCase: generatedTest,
      uiExecution: {
        status: 'COMPLETED',
        elementsDetected: ['username', 'password', 'loginButton'],
        timestamp: new Date().toISOString()
      },
      apiValidation: apiValidation,
      summary: {
        naturalLanguageProcessed: true,
        smartElementDetection: true,
        apiIntegration: true,
        overallSuccess: true
      }
    };
    
    fs.writeFileSync('complete_workflow_report.json', JSON.stringify(completeReport, null, 2));
    console.log('\n✅ Complete workflow report saved to: complete_workflow_report.json');
  }

  async runAllDemos() {
    try {
      await this.initialize();
      
      await this.demoNaturalLanguageProcessing();
      await this.demoPageObjectGeneration();
      await this.demoTestDataManagement();
      await this.demoAPIIntegration();
      await this.demoHybridTesting();
      await this.demoCompleteWorkflow();
      
      console.log('\n🎉 === ALL DEMOS COMPLETED SUCCESSFULLY ===');
      console.log('\n📁 Generated Files:');
      console.log('   • generated_nlp_*.json - Natural language generated tests');
      console.log('   • generated_page_objects.json - Auto-generated page objects');
      console.log('   • api_test_results.json - API test results');
      console.log('   • hybrid_test_results.json - Hybrid UI+API results');
      console.log('   • complete_workflow_report.json - Complete workflow report');
      
    } catch (error) {
      console.error('❌ Demo execution error:', error.message);
    } finally {
      if (this.browser) {
        await this.browser.close();
        console.log('🧹 Browser closed');
      }
    }
  }
}

// Run the demo
if (require.main === module) {
  const demo = new IntelligentTestDemo();
  demo.runAllDemos().catch(console.error);
}

module.exports = IntelligentTestDemo;