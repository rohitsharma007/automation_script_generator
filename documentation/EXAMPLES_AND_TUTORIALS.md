# 🎯 Intelligent Test Generation - Practical Examples

This guide provides hands-on examples to demonstrate the powerful features of our Intelligent Test Generation Framework.

## 📋 Table of Contents

1. [Quick Start Examples](#quick-start-examples)
2. [Natural Language Processing Examples](#natural-language-processing-examples)
3. [Page Object Model Auto-Generation](#page-object-model-auto-generation)
4. [API Integration Testing](#api-integration-testing)
5. [Hybrid UI + API Testing](#hybrid-ui--api-testing)
6. [Smart Element Detection](#smart-element-detection)
7. [Real-World Scenarios](#real-world-scenarios)

---

## 🚀 Quick Start Examples

### Example 1: Basic Login Test Generation

```javascript
const IntelligentTestGenerator = require('./utils/intelligent_test_generator');

const generator = new IntelligentTestGenerator();

// Generate a complete login test from natural language
const loginTest = generator.generateCompleteTestCase(
  "Navigate to https://demo.testfire.net. Fill username with 'admin'. Fill password with 'admin'. Click login button. Verify successful login.",
  {
    testCaseId: 'Banking_Login_Test',
    testType: 'login',
    baseUrl: 'https://demo.testfire.net'
  }
);

console.log('Generated Test:', JSON.stringify(loginTest, null, 2));
```

**Expected Output:**
```json
{
  "test_case_id": "Banking_Login_Test",
  "description": "Navigate to https://demo.testfire.net. Fill username with 'admin'. Fill password with 'admin'. Click login button. Verify successful login.",
  "test_steps": [
    {
      "step": 1,
      "action": "Navigate to URL",
      "url": "https://demo.testfire.net",
      "description": "navigate to https://demo.testfire.net"
    },
    {
      "step": 2,
      "action": "Fill username field",
      "elementType": "username",
      "value": "admin",
      "description": "fill username with 'admin'"
    },
    {
      "step": 3,
      "action": "Fill password field",
      "elementType": "password",
      "value": "admin",
      "description": "fill password with 'admin'"
    },
    {
      "step": 4,
      "action": "Click button",
      "elementType": "loginButton",
      "description": "click login button"
    },
    {
      "step": 5,
      "action": "Verify successful action",
      "elementType": "successIndicator",
      "description": "verify successful login"
    }
  ],
  "test_data": {
    "username": "admin",
    "password": "admin"
  }
}
```

### Example 2: E-commerce Shopping Test

```javascript
// Generate an e-commerce test scenario
const shoppingTest = generator.generateCompleteTestCase(
  "Navigate to https://www.saucedemo.com. Login with standard_user and secret_sauce. Add Sauce Labs Backpack to cart. Go to cart. Proceed to checkout. Fill shipping information. Complete purchase.",
  {
    testCaseId: 'Ecommerce_Purchase_Flow',
    testType: 'ecommerce'
  }
);

// Save the generated test
generator.saveTestCase(shoppingTest, 'ecommerce_test.json');
```

---

## 🗣️ Natural Language Processing Examples

### Example 3: Registration Form Test

```javascript
// Complex registration scenario
const registrationDescription = `
  Navigate to registration page at https://example.com/register.
  Fill first name with John.
  Fill last name with Doe.
  Fill email with john.doe@example.com.
  Fill phone number with 555-1234.
  Select country as United States.
  Fill password with SecurePass123.
  Confirm password with SecurePass123.
  Check terms and conditions checkbox.
  Click register button.
  Verify registration success message appears.
`;

const registrationTest = generator.processNaturalLanguage(
  registrationDescription,
  'Registration_Complete_Flow'
);

console.log('Registration Test Steps:', registrationTest.test_steps.length);
// Output: Registration Test Steps: 10
```

### Example 4: Multi-Step Workflow

```javascript
// Complex business workflow
const workflowDescription = `
  Navigate to admin dashboard.
  Click users menu.
  Click add new user button.
  Fill user details form.
  Select user role as Manager.
  Set permissions for user.
  Save user profile.
  Send welcome email.
  Verify user appears in user list.
  Logout from admin panel.
`;

const workflowTest = generator.processNaturalLanguage(
  workflowDescription,
  'Admin_User_Management'
);

// Export as executable test
generator.exportAsPlaywrightTest(workflowTest, 'admin_workflow.spec.js');
```

---

## 🏗️ Page Object Model Auto-Generation

### Example 5: Login Page Object

```javascript
// Define elements discovered on login page
const loginPageElements = {
  usernameField: '#username',
  passwordField: '#password',
  loginButton: '.login-btn',
  forgotPasswordLink: 'a[href*="forgot"]',
  errorMessage: '.error-message',
  rememberMeCheckbox: '#remember-me',
  signUpLink: 'a[href*="signup"]'
};

// Generate page object
const loginPageObject = generator.generatePageObject('LoginPage', loginPageElements);

console.log('Generated Page Object:', loginPageObject);
```

**Generated Page Object:**
```json
{
  "className": "LoginPage",
  "elements": {
    "usernameField": {
      "selector": "#username",
      "type": "input"
    },
    "passwordField": {
      "selector": "#password",
      "type": "password"
    },
    "loginButton": {
      "selector": ".login-btn",
      "type": "button"
    }
  },
  "methods": {
    "fillUsernameField": {
      "action": "fill",
      "selector": "#username",
      "description": "Fill usernameField field"
    },
    "fillPasswordField": {
      "action": "fill",
      "selector": "#password",
      "description": "Fill passwordField field"
    },
    "clickLoginButton": {
      "action": "click",
      "selector": ".login-btn",
      "description": "Click loginButton"
    },
    "verifyErrorMessage": {
      "action": "verify",
      "selector": ".error-message",
      "description": "Verify errorMessage is visible"
    }
  }
}
```

### Example 6: E-commerce Product Page

```javascript
// Product page elements
const productPageElements = {
  productTitle: 'h1.product-title',
  productPrice: '.price',
  productImage: '.product-image img',
  addToCartButton: '#add-to-cart',
  quantitySelector: 'select[name="quantity"]',
  productDescription: '.product-description',
  reviewsSection: '#reviews',
  relatedProducts: '.related-products'
};

const productPageObject = generator.generatePageObject('ProductPage', productPageElements);

// Add to page object collection
generator.addPageObject('ProductPage', productPageObject);

// Export all page objects
generator.exportPageObjects('all_page_objects.json');
```

---

## 🌐 API Integration Testing

### Example 7: User Management API Tests

```javascript
const APIIntegrationTester = require('./utils/api_integration_tester');

const apiTester = new APIIntegrationTester();

// Test 1: Get user profile
const getUserTest = {
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
};

// Test 2: Create new user
const createUserTest = {
  step: 2,
  action: 'API Request',
  method: 'POST',
  url: 'https://jsonplaceholder.typicode.com/users',
  body: {
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com'
  },
  expectedStatus: 201,
  validation: [
    { type: 'json_path', path: 'id', expected: 'not_empty' },
    { type: 'json_path', path: 'name', expected: 'John Doe' }
  ]
};

// Execute API tests
async function runAPITests() {
  const result1 = await apiTester.executeAPIRequest(getUserTest);
  const result2 = await apiTester.executeAPIRequest(createUserTest);
  
  console.log('API Test Results:', {
    getUserTest: result1.passed,
    createUserTest: result2.passed
  });
  
  // Save results
  apiTester.saveAPIResults('user_management_api_tests.json');
}

runAPITests();
```

### Example 8: Authentication Flow API Test

```javascript
// Authentication workflow
const authTests = [
  {
    step: 1,
    action: 'API Request',
    method: 'POST',
    url: 'https://api.example.com/auth/login',
    body: {
      username: 'testuser',
      password: 'testpass'
    },
    expectedStatus: 200,
    validation: [
      { type: 'json_path', path: 'token', expected: 'not_empty' },
      { type: 'json_path', path: 'expires_in', expected: 'greater_than', value: 0 }
    ],
    saveToken: 'authToken' // Save token for subsequent requests
  },
  {
    step: 2,
    action: 'API Request',
    method: 'GET',
    url: 'https://api.example.com/user/profile',
    headers: {
      'Authorization': 'Bearer {{authToken}}' // Use saved token
    },
    expectedStatus: 200,
    validation: [
      { type: 'json_path', path: 'user.id', expected: 'not_empty' }
    ]
  }
];

// Execute authentication flow
async function runAuthFlow() {
  for (const test of authTests) {
    const result = await apiTester.executeAPIRequest(test);
    console.log(`Step ${test.step}: ${result.passed ? 'PASSED' : 'FAILED'}`);
  }
}
```

---

## 🔄 Hybrid UI + API Testing

### Example 9: E-commerce Order Verification

```javascript
// UI steps for placing an order
const uiSteps = [
  {
    action: 'navigate',
    url: 'https://www.saucedemo.com'
  },
  {
    action: 'fill',
    selector: '#user-name',
    value: 'standard_user'
  },
  {
    action: 'fill',
    selector: '#password',
    value: 'secret_sauce'
  },
  {
    action: 'click',
    selector: '#login-button'
  },
  {
    action: 'click',
    selector: '[data-test="add-to-cart-sauce-labs-backpack"]'
  },
  {
    action: 'click',
    selector: '.shopping_cart_link'
  },
  {
    action: 'click',
    selector: '#checkout'
  }
];

// API steps to verify order in backend
const apiSteps = [
  {
    method: 'GET',
    url: 'https://api.saucedemo.com/orders/latest',
    validation: [
      { type: 'json_path', path: 'items[0].name', expected: 'Sauce Labs Backpack' },
      { type: 'json_path', path: 'status', expected: 'pending' }
    ]
  },
  {
    method: 'GET',
    url: 'https://api.saucedemo.com/inventory/1',
    validation: [
      { type: 'json_path', path: 'stock_count', expected: 'greater_than', value: 0 }
    ]
  }
];

// Execute hybrid test
async function runHybridTest(page) {
  const results = await apiTester.executeHybridWorkflow(uiSteps, apiSteps, page);
  
  console.log('Hybrid Test Results:', {
    uiStepsPassed: results.uiResults.passed,
    apiStepsPassed: results.apiResults.passed,
    overallSuccess: results.success
  });
  
  return results;
}
```

### Example 10: User Registration with Email Verification

```javascript
// UI: Register new user
const registrationUISteps = [
  { action: 'navigate', url: 'https://example.com/register' },
  { action: 'fill', selector: '#firstName', value: 'John' },
  { action: 'fill', selector: '#lastName', value: 'Doe' },
  { action: 'fill', selector: '#email', value: 'john.doe@example.com' },
  { action: 'fill', selector: '#password', value: 'SecurePass123' },
  { action: 'click', selector: '#register-btn' }
];

// API: Verify user creation and email sent
const verificationAPISteps = [
  {
    method: 'GET',
    url: 'https://api.example.com/users/search?email=john.doe@example.com',
    validation: [
      { type: 'json_path', path: 'users[0].email', expected: 'john.doe@example.com' },
      { type: 'json_path', path: 'users[0].status', expected: 'pending_verification' }
    ]
  },
  {
    method: 'GET',
    url: 'https://api.example.com/emails/sent?recipient=john.doe@example.com',
    validation: [
      { type: 'json_path', path: 'emails[0].subject', expected: 'contains', value: 'verification' },
      { type: 'json_path', path: 'emails[0].status', expected: 'sent' }
    ]
  }
];

// Execute complete registration flow
async function runRegistrationFlow(page) {
  const results = await apiTester.executeHybridWorkflow(
    registrationUISteps, 
    verificationAPISteps, 
    page
  );
  
  // Save detailed results
  apiTester.saveHybridResults('registration_flow_results.json');
  
  return results;
}
```

---

## 🎯 Smart Element Detection

### Example 11: Adaptive Element Detection

```javascript
const SmartElementDetector = require('./utils/smart_element_detector');
const { chromium } = require('playwright');

async function demonstrateSmartDetection() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const detector = new SmartElementDetector(page);
  
  // Navigate to any login page
  await page.goto('https://the-internet.herokuapp.com/login');
  
  // Smart detection finds elements without specific selectors
  const usernameElement = await detector.detectElement('username');
  const passwordElement = await detector.detectElement('password');
  const loginButton = await detector.detectElement('loginButton');
  
  console.log('Detected Elements:', {
    username: usernameElement ? usernameElement.selector : 'Not found',
    password: passwordElement ? passwordElement.selector : 'Not found',
    loginButton: loginButton ? loginButton.selector : 'Not found'
  });
  
  // Use detected elements
  if (usernameElement && passwordElement && loginButton) {
    await page.fill(usernameElement.selector, 'tomsmith');
    await page.fill(passwordElement.selector, 'SuperSecretPassword!');
    await page.click(loginButton.selector);
    
    // Learn from successful interaction
    await detector.learnFromSuccess('username', usernameElement.selector, {
      url: page.url(),
      action: 'fill'
    });
  }
  
  await browser.close();
}

demonstrateSmart Detection();
```

### Example 12: Cross-Application Element Detection

```javascript
// Test smart detection across different applications
const testSites = [
  'https://www.saucedemo.com',
  'https://opensource-demo.orangehrmlive.com',
  'https://the-internet.herokuapp.com/login',
  'https://demo.testfire.net'
];

async function testCrossApplicationDetection() {
  const browser = await chromium.launch();
  const results = [];
  
  for (const site of testSites) {
    const page = await browser.newPage();
    const detector = new SmartElementDetector(page);
    
    try {
      await page.goto(site);
      
      const detectionResults = {
        site: site,
        elements: {
          username: await detector.detectElement('username'),
          password: await detector.detectElement('password'),
          loginButton: await detector.detectElement('loginButton')
        }
      };
      
      // Calculate confidence scores
      for (const [elementType, element] of Object.entries(detectionResults.elements)) {
        if (element) {
          const confidence = await detector.getConfidenceScore(element.element, elementType);
          element.confidence = confidence;
        }
      }
      
      results.push(detectionResults);
      
    } catch (error) {
      console.log(`Error testing ${site}:`, error.message);
    }
    
    await page.close();
  }
  
  await browser.close();
  
  // Display results
  console.log('Cross-Application Detection Results:');
  results.forEach(result => {
    console.log(`\n${result.site}:`);
    Object.entries(result.elements).forEach(([type, element]) => {
      if (element) {
        console.log(`  ${type}: ${element.selector} (${element.confidence}% confidence)`);
      } else {
        console.log(`  ${type}: Not detected`);
      }
    });
  });
  
  return results;
}
```

---

## 🌍 Real-World Scenarios

### Example 13: Complete E-commerce Testing Suite

```javascript
// Complete e-commerce test suite using all features
class EcommerceTestSuite {
  constructor() {
    this.generator = new IntelligentTestGenerator();
    this.apiTester = new APIIntegrationTester();
  }
  
  async runCompleteTestSuite() {
    // 1. Generate test cases from natural language
    const testScenarios = [
      "User registration and email verification",
      "Product search and filtering",
      "Add multiple items to cart",
      "Checkout process with payment",
      "Order tracking and status updates"
    ];
    
    const generatedTests = testScenarios.map(scenario => 
      this.generator.processNaturalLanguage(scenario, `Ecommerce_${scenario.replace(/\s+/g, '_')}`)
    );
    
    // 2. Execute UI tests with smart element detection
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const detector = new SmartElementDetector(page);
    
    const uiResults = [];
    
    for (const test of generatedTests) {
      try {
        const result = await this.executeUITest(test, page, detector);
        uiResults.push(result);
      } catch (error) {
        console.log(`UI Test failed: ${test.test_case_id}`, error.message);
      }
    }
    
    // 3. Execute API validation tests
    const apiTests = [
      {
        method: 'GET',
        url: 'https://api.ecommerce.com/products',
        validation: [{ type: 'not_empty' }]
      },
      {
        method: 'GET',
        url: 'https://api.ecommerce.com/categories',
        validation: [{ type: 'json_path', path: 'length', expected: 'greater_than', value: 0 }]
      }
    ];
    
    const apiResults = [];
    for (const apiTest of apiTests) {
      const result = await this.apiTester.executeAPIRequest(apiTest);
      apiResults.push(result);
    }
    
    // 4. Generate comprehensive report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: generatedTests.length + apiTests.length,
        uiTestsPassed: uiResults.filter(r => r.passed).length,
        apiTestsPassed: apiResults.filter(r => r.passed).length
      },
      detailedResults: {
        uiTests: uiResults,
        apiTests: apiResults
      }
    };
    
    // Save report
    require('fs').writeFileSync(
      'ecommerce_test_suite_report.json', 
      JSON.stringify(report, null, 2)
    );
    
    await browser.close();
    return report;
  }
  
  async executeUITest(testCase, page, detector) {
    // Implementation for executing UI test with smart detection
    // This would use the generated test steps and smart element detection
    return {
      testCaseId: testCase.test_case_id,
      passed: true, // Actual implementation would determine this
      executionTime: Date.now(),
      steps: testCase.test_steps.length
    };
  }
}

// Run the complete test suite
const testSuite = new EcommerceTestSuite();
testSuite.runCompleteTestSuite().then(report => {
  console.log('Test Suite Completed:', report.summary);
});
```

### Example 14: Banking Application Testing

```javascript
// Banking application comprehensive testing
const bankingTestDescription = `
  Navigate to online banking portal.
  Login with valid credentials.
  Check account balance.
  Transfer money between accounts.
  Pay a bill online.
  Download account statement.
  Update profile information.
  Logout securely.
`;

// Generate banking test suite
const bankingTest = generator.generateCompleteTestCase(
  bankingTestDescription,
  {
    testCaseId: 'Banking_Complete_Flow',
    testType: 'banking',
    baseUrl: 'https://demo.testfire.net'
  }
);

// Add API validations for banking operations
const bankingAPIValidations = [
  {
    method: 'GET',
    url: 'https://api.bank.com/accounts/balance',
    validation: [
      { type: 'json_path', path: 'balance', expected: 'greater_than', value: 0 },
      { type: 'json_path', path: 'currency', expected: 'USD' }
    ]
  },
  {
    method: 'GET',
    url: 'https://api.bank.com/transactions/recent',
    validation: [
      { type: 'json_path', path: 'transactions', expected: 'is_array' },
      { type: 'response_time', maxTime: 3000 }
    ]
  }
];

// Execute complete banking test
async function runBankingTest(page) {
  const results = await apiTester.executeHybridWorkflow(
    bankingTest.test_steps,
    bankingAPIValidations,
    page
  );
  
  console.log('Banking Test Results:', results);
  return results;
}
```

---

## 🎉 Running the Examples

To run these examples:

1. **Setup:**
   ```bash
   npm install playwright axios
   ```

2. **Run Individual Examples:**
   ```bash
   node -e "$(cat example_code_here)"
   ```

3. **Run Complete Demo:**
   ```bash
   node intelligent_test_demo.js
   ```

4. **Check Generated Files:**
   - Look for `*.json` files with test results
   - Review generated page objects
   - Examine API test reports

## 📊 Expected Outputs

Each example will generate:
- **Test Case JSON files** with structured test steps
- **Page Object definitions** for reusable components
- **API test results** with validation outcomes
- **Execution reports** with timing and success metrics
- **Learning data** for improved future detections

These examples demonstrate the full power of the Intelligent Test Generation Framework, showing how it can transform manual testing into an automated, intelligent process that adapts to different applications and continuously improves its accuracy!