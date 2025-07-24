# 🧠 Intelligent Test Generation Framework

A comprehensive automation framework that combines Natural Language Processing, Smart Element Detection, Page Object Model Auto-Generation, Test Data Management, and API Integration Testing.

## 🚀 Features Overview

### 1. 🗣️ Natural Language Processing
Convert plain English descriptions into executable test steps.

**Example Input:**
```
"Navigate to https://www.saucedemo.com/. Fill username with 'standard_user'. Fill password with 'secret_sauce'. Click login button. Verify successful login."
```

**Generated Output:**
```json
{
  "test_case_id": "NLP_SauceDemo",
  "test_steps": [
    {
      "step": 1,
      "action": "Navigate to URL",
      "url": "https://www.saucedemo.com/"
    },
    {
      "step": 2,
      "action": "Fill username field",
      "elementType": "username",
      "value": "standard_user"
    },
    {
      "step": 3,
      "action": "Fill password field",
      "elementType": "password",
      "value": "secret_sauce"
    },
    {
      "step": 4,
      "action": "Click button",
      "elementType": "loginButton"
    },
    {
      "step": 5,
      "action": "Verify successful action",
      "elementType": "successIndicator"
    }
  ]
}
```

### 2. 🏗️ Page Object Model Auto-Generation
Automatically create reusable page objects from discovered elements.

**Input Elements:**
```javascript
const loginPageElements = {
  usernameField: '#user-name',
  passwordField: '#password',
  loginButton: '#login-button',
  errorMessage: '[data-test="error"]'
};
```

**Generated Page Object:**
```json
{
  "className": "LoginPage",
  "elements": {
    "usernameField": {
      "selector": "#user-name",
      "type": "element"
    },
    "passwordField": {
      "selector": "#password",
      "type": "password"
    }
  },
  "methods": {
    "fillUsernameField": {
      "action": "fill",
      "selector": "#user-name",
      "description": "Fill usernameField field"
    },
    "clickLoginButton": {
      "action": "click",
      "selector": "#login-button",
      "description": "Click loginButton"
    }
  }
}
```

### 3. 📊 Smart Test Data Management
Intelligent generation and management of test data with uniqueness guarantees.

**Available Data Types:**
- **Login Data**: Username, password, email
- **Registration Data**: First name, last name, email, phone
- **E-commerce Data**: Product names, quantities, prices

**Example Generated Data:**
```json
{
  "username": "testuser3396",
  "password": "admin123",
  "email": "user+1753385093396@demo.com"
}
```

### 4. 🌐 API Integration Testing
Combine UI and API testing in unified workflows with comprehensive validation.

**API Test Features:**
- HTTP method support (GET, POST, PUT, DELETE)
- Response validation (status, headers, body)
- JSON path validation
- Schema validation
- Authentication token management
- Cookie handling
- Response time validation

**Example API Test:**
```javascript
const apiStep = {
  step: 1,
  action: 'API Request',
  method: 'GET',
  url: 'https://api.example.com/users/1',
  expectedStatus: 200,
  validation: [
    { type: 'json_path', path: 'name', expected: 'John Doe' },
    { type: 'not_empty' },
    { type: 'response_time', maxTime: 1000 }
  ]
};
```

### 5. 🎯 Smart Element Detection
Intelligent element detection using multiple strategies:
- Direct selectors
- Attribute analysis
- Label association
- Placeholder text
- Semantic analysis
- Visual patterns
- Learning from success

## 📁 File Structure

```
utils/
├── intelligent_test_generator.js    # NLP and test generation
├── api_integration_tester.js        # API testing capabilities
├── smart_element_detector.js        # Smart element detection
intelligent_test_demo.js             # Comprehensive demo
INTELLIGENT_TEST_GENERATION_GUIDE.md # This documentation
```

## 🛠️ Usage Examples

### Basic Natural Language Test Generation

```javascript
const IntelligentTestGenerator = require('./utils/intelligent_test_generator');

const generator = new IntelligentTestGenerator();

// Generate test from natural language
const testCase = generator.generateCompleteTestCase(
  "Navigate to login page. Fill username and password. Click submit.",
  {
    testCaseId: 'MyTest',
    testType: 'login',
    baseUrl: 'https://example.com'
  }
);

// Save generated test
generator.saveTestCase(testCase, 'my_test.json');
```

### Page Object Generation

```javascript
// Define discovered elements
const elements = {
  usernameField: '#username',
  passwordField: '#password',
  submitButton: '.submit-btn'
};

// Generate page object
const pageObject = generator.generatePageObject('login', elements);

// Export all page objects
generator.exportPageObjects('page_objects.json');
```

### API Integration Testing

```javascript
const APIIntegrationTester = require('./utils/api_integration_tester');

const apiTester = new APIIntegrationTester();

// Execute API request with validation
const result = await apiTester.executeAPIRequest({
  step: 1,
  method: 'POST',
  url: 'https://api.example.com/login',
  body: { username: 'test', password: 'pass' },
  expectedStatus: 200,
  validation: [
    { type: 'json_path', path: 'token', expected: 'not_empty' }
  ]
});

// Save results
apiTester.saveAPIResults('api_results.json');
```

### Hybrid UI + API Testing

```javascript
// Define UI steps
const uiSteps = [
  { action: 'navigate', url: 'https://example.com' },
  { action: 'fill', selector: '#username', value: 'test' },
  { action: 'click', selector: '#login' }
];

// Define API steps
const apiSteps = [
  {
    method: 'GET',
    url: 'https://api.example.com/profile',
    validation: [{ type: 'not_empty' }]
  }
];

// Execute hybrid workflow
const results = await apiTester.executeHybridWorkflow(uiSteps, apiSteps, page);
```

### Smart Element Detection Integration

```javascript
const SmartElementDetector = require('./utils/smart_element_detector');

const detector = new SmartElementDetector(page);

// Detect elements intelligently
const usernameElement = await detector.detectElement('username');
const passwordElement = await detector.detectElement('password');
const loginButton = await detector.detectElement('loginButton');

// Use detected elements
if (usernameElement) {
  await page.fill(usernameElement.selector, 'testuser');
  
  // Learn from successful detection
  await detector.learnFromSuccess('username', usernameElement.selector, {
    url: page.url(),
    action: 'fill'
  });
}
```

## 🎯 Advanced Features

### Custom Test Data Templates

```javascript
// Add custom test data template
generator.testDataTemplates.customApp = {
  companyName: ['Acme Corp', 'Test Inc', 'Demo LLC'],
  department: ['Engineering', 'Sales', 'Marketing'],
  budget: [10000, 25000, 50000]
};

// Generate custom test data
const customData = generator.generateTestData('customApp');
```

### API Authentication Handling

```javascript
// Set authentication tokens
apiTester.authTokens.bearer = 'your-jwt-token';
apiTester.authTokens.apiKey = 'your-api-key';

// Tokens are automatically included in subsequent requests
```

### Element Detection Confidence Scoring

```javascript
const detection = await detector.detectElement('loginButton');
if (detection) {
  const confidence = await detector.getConfidenceScore(
    detection.element, 
    'loginButton'
  );
  console.log(`Detection confidence: ${confidence}%`);
}
```

## 📊 Generated Reports

The framework generates comprehensive reports:

1. **Test Analysis Reports** - Detailed test execution results
2. **API Test Results** - API validation outcomes with timing
3. **Page Object Exports** - Reusable page object definitions
4. **Hybrid Test Reports** - Combined UI + API test results
5. **Complete Workflow Reports** - End-to-end test execution summaries

## 🔧 Configuration Options

### Test Generator Configuration

```javascript
const options = {
  testCaseId: 'MyCustomTest',
  testType: 'login', // 'login', 'registration', 'ecommerce'
  baseUrl: 'https://example.com',
  customData: {
    username: 'specific-user',
    password: 'specific-pass'
  }
};
```

### API Tester Configuration

```javascript
// Set default headers
apiTester.baseHeaders = {
  'Content-Type': 'application/json',
  'X-Custom-Header': 'value'
};

// Set timeout
const apiStep = {
  // ... other properties
  timeout: 30000 // 30 seconds
};
```

### Smart Detector Configuration

```javascript
// The detector automatically learns from successful detections
// and improves accuracy over time

// Manual learning
detector.learnFromSuccess('elementType', 'selector', {
  url: 'https://example.com',
  action: 'click',
  context: 'additional-info'
});
```

## 🚀 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install playwright axios
   ```

2. **Run the Demo:**
   ```bash
   node intelligent_test_demo.js
   ```

3. **Check Generated Files:**
   - `generated_nlp_*.json` - Natural language generated tests
   - `generated_page_objects.json` - Auto-generated page objects
   - `api_test_results.json` - API test results
   - `hybrid_test_results.json` - Hybrid UI+API results
   - `complete_workflow_report.json` - Complete workflow report

## 🎉 Benefits

✅ **Zero Configuration** - No need to manually specify selectors
✅ **Natural Language Input** - Write tests in plain English
✅ **Cross-Application Compatibility** - Works with any web application
✅ **Self-Improving** - Learns from successful detections
✅ **Comprehensive Testing** - Combines UI and API testing
✅ **Detailed Reporting** - Rich test execution reports
✅ **Reusable Components** - Auto-generated page objects
✅ **Smart Data Management** - Intelligent test data generation

This intelligent test generation framework transforms manual test creation into an automated, intelligent process that adapts to different applications and continuously improves its accuracy!