const axios = require('axios');
const fs = require('fs');
const path = require('path');

class APIIntegrationTester {
  constructor() {
    this.apiResults = [];
    this.cookies = {};
    this.authTokens = {};
    this.baseHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Playwright-API-Tester/1.0'
    };
  }

  // Execute API request with comprehensive validation
  async executeAPIRequest(step, context = {}) {
    const startTime = Date.now();
    let result = {
      step: step.step,
      action: step.action,
      method: step.method,
      url: step.url,
      status: 'PENDING',
      startTime: new Date().toISOString(),
      duration: 0,
      response: null,
      error: null,
      validations: []
    };

    try {
      // Prepare request configuration
      const config = {
        method: step.method.toLowerCase(),
        url: step.url,
        headers: { ...this.baseHeaders, ...step.headers },
        timeout: step.timeout || 30000
      };

      // Add authentication if available
      if (this.authTokens.bearer) {
        config.headers['Authorization'] = `Bearer ${this.authTokens.bearer}`;
      }
      if (this.authTokens.apiKey) {
        config.headers['X-API-Key'] = this.authTokens.apiKey;
      }

      // Add cookies if available
      if (Object.keys(this.cookies).length > 0) {
        config.headers['Cookie'] = Object.entries(this.cookies)
          .map(([key, value]) => `${key}=${value}`)
          .join('; ');
      }

      // Add request body for POST/PUT/PATCH
      if (['post', 'put', 'patch'].includes(config.method) && step.body) {
        config.data = step.body;
      }

      // Add query parameters for GET requests
      if (step.params) {
        config.params = step.params;
      }

      console.log(`🌐 API Request: ${step.method} ${step.url}`);
      
      // Execute the request
      const response = await axios(config);
      
      result.duration = Date.now() - startTime;
      result.response = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        size: JSON.stringify(response.data).length
      };

      // Store cookies from response
      if (response.headers['set-cookie']) {
        this.extractCookies(response.headers['set-cookie']);
      }

      // Extract auth tokens from response
      this.extractAuthTokens(response.data);

      // Validate response
      const validationResults = await this.validateResponse(response, step);
      result.validations = validationResults;

      // Check if all validations passed
      const allValidationsPassed = validationResults.every(v => v.passed);
      result.status = allValidationsPassed ? 'PASSED' : 'FAILED';

      console.log(`✅ API Response: ${response.status} ${response.statusText}`);
      
    } catch (error) {
      result.duration = Date.now() - startTime;
      result.status = 'FAILED';
      result.error = {
        message: error.message,
        code: error.code,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : null
      };
      
      console.log(`❌ API Error: ${error.message}`);
    }

    result.endTime = new Date().toISOString();
    this.apiResults.push(result);
    return result;
  }

  // Validate API response against expected criteria
  async validateResponse(response, step) {
    const validations = [];
    
    // Status code validation
    if (step.expectedStatus) {
      validations.push({
        type: 'status_code',
        expected: step.expectedStatus,
        actual: response.status,
        passed: response.status === step.expectedStatus,
        message: `Expected status ${step.expectedStatus}, got ${response.status}`
      });
    }

    // Response time validation
    if (step.maxResponseTime) {
      const responseTime = Date.now() - new Date(step.startTime).getTime();
      validations.push({
        type: 'response_time',
        expected: `<= ${step.maxResponseTime}ms`,
        actual: `${responseTime}ms`,
        passed: responseTime <= step.maxResponseTime,
        message: `Response time should be <= ${step.maxResponseTime}ms, got ${responseTime}ms`
      });
    }

    // Custom validations
    if (step.validation && Array.isArray(step.validation)) {
      for (const validation of step.validation) {
        const result = await this.executeCustomValidation(response, validation);
        validations.push(result);
      }
    }

    // Schema validation
    if (step.schema) {
      const schemaValidation = this.validateSchema(response.data, step.schema);
      validations.push(schemaValidation);
    }

    return validations;
  }

  // Execute custom validation rules
  async executeCustomValidation(response, validation) {
    const result = {
      type: validation.type || 'custom',
      expected: validation.expected,
      actual: null,
      passed: false,
      message: validation.message || 'Custom validation'
    };

    try {
      switch (validation.type) {
        case 'json_path':
          result.actual = this.getValueByPath(response.data, validation.path);
          result.passed = result.actual === validation.expected;
          break;
          
        case 'contains':
          const responseText = JSON.stringify(response.data);
          result.actual = responseText.includes(validation.expected);
          result.passed = result.actual;
          break;
          
        case 'not_empty':
          result.actual = response.data && Object.keys(response.data).length > 0;
          result.passed = result.actual;
          break;
          
        case 'array_length':
          if (Array.isArray(response.data)) {
            result.actual = response.data.length;
            result.passed = result.actual === validation.expected;
          }
          break;
          
        case 'header_exists':
          result.actual = response.headers[validation.header] !== undefined;
          result.passed = result.actual;
          break;
          
        default:
          result.message = `Unknown validation type: ${validation.type}`;
      }
    } catch (error) {
      result.error = error.message;
      result.passed = false;
    }

    return result;
  }

  // Validate response against JSON schema
  validateSchema(data, schema) {
    // Simple schema validation (can be enhanced with ajv library)
    const result = {
      type: 'schema',
      expected: 'Valid schema',
      actual: 'Schema validation',
      passed: true,
      message: 'Schema validation'
    };

    try {
      for (const [field, rules] of Object.entries(schema)) {
        if (rules.required && !data.hasOwnProperty(field)) {
          result.passed = false;
          result.message = `Required field '${field}' is missing`;
          break;
        }
        
        if (data[field] && rules.type && typeof data[field] !== rules.type) {
          result.passed = false;
          result.message = `Field '${field}' should be ${rules.type}, got ${typeof data[field]}`;
          break;
        }
      }
    } catch (error) {
      result.passed = false;
      result.message = `Schema validation error: ${error.message}`;
    }

    return result;
  }

  // Extract cookies from response headers
  extractCookies(setCookieHeaders) {
    for (const cookieHeader of setCookieHeaders) {
      const [cookiePart] = cookieHeader.split(';');
      const [name, value] = cookiePart.split('=');
      if (name && value) {
        this.cookies[name.trim()] = value.trim();
        console.log(`🍪 Stored cookie: ${name.trim()}`);
      }
    }
  }

  // Extract authentication tokens from response
  extractAuthTokens(responseData) {
    if (responseData) {
      // Common token field names
      const tokenFields = ['token', 'access_token', 'accessToken', 'authToken', 'jwt'];
      const apiKeyFields = ['api_key', 'apiKey', 'key'];
      
      for (const field of tokenFields) {
        if (responseData[field]) {
          this.authTokens.bearer = responseData[field];
          console.log(`🔑 Stored bearer token from field: ${field}`);
          break;
        }
      }
      
      for (const field of apiKeyFields) {
        if (responseData[field]) {
          this.authTokens.apiKey = responseData[field];
          console.log(`🗝️ Stored API key from field: ${field}`);
          break;
        }
      }
    }
  }

  // Get value from nested object using dot notation
  getValueByPath(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  // Combine UI and API testing workflows
  async executeHybridWorkflow(uiSteps, apiSteps, page) {
    const results = {
      ui: [],
      api: [],
      combined: true,
      startTime: new Date().toISOString()
    };

    try {
      // Execute UI steps first (e.g., login to get session)
      console.log('🎭 Executing UI steps...');
      for (const uiStep of uiSteps) {
        const uiResult = await this.executeUIStep(uiStep, page);
        results.ui.push(uiResult);
        
        // Extract data from UI for API use
        if (uiStep.extractData) {
          await this.extractDataFromUI(page, uiStep.extractData);
        }
      }

      // Execute API steps with UI context
      console.log('🌐 Executing API steps...');
      for (const apiStep of apiSteps) {
        const apiResult = await this.executeAPIRequest(apiStep);
        results.api.push(apiResult);
        
        // Use API response in UI if needed
        if (apiStep.useInUI && page) {
          await this.injectAPIDataToUI(page, apiResult.response.data, apiStep.useInUI);
        }
      }

    } catch (error) {
      results.error = error.message;
      results.combined = false;
    }

    results.endTime = new Date().toISOString();
    return results;
  }

  // Execute UI step (simplified)
  async executeUIStep(step, page) {
    const startTime = Date.now();
    let result = {
      step: step.step,
      action: step.action,
      status: 'PENDING',
      startTime: new Date().toISOString()
    };

    try {
      switch (step.action.toLowerCase()) {
        case 'navigate':
          await page.goto(step.url);
          break;
        case 'fill':
          await page.fill(step.selector, step.value);
          break;
        case 'click':
          await page.click(step.selector);
          break;
        case 'wait':
          await page.waitForSelector(step.selector);
          break;
      }
      
      result.status = 'PASSED';
    } catch (error) {
      result.status = 'FAILED';
      result.error = error.message;
    }

    result.duration = Date.now() - startTime;
    result.endTime = new Date().toISOString();
    return result;
  }

  // Extract data from UI elements
  async extractDataFromUI(page, extractConfig) {
    for (const [key, selector] of Object.entries(extractConfig)) {
      try {
        const value = await page.textContent(selector);
        if (key === 'sessionToken') {
          this.authTokens.bearer = value;
        } else if (key === 'userId') {
          this.authTokens.userId = value;
        }
        console.log(`📤 Extracted ${key}: ${value}`);
      } catch (error) {
        console.log(`⚠️ Failed to extract ${key}: ${error.message}`);
      }
    }
  }

  // Inject API data into UI
  async injectAPIDataToUI(page, apiData, injectConfig) {
    for (const [field, selector] of Object.entries(injectConfig)) {
      try {
        const value = this.getValueByPath(apiData, field);
        if (value) {
          await page.fill(selector, value.toString());
          console.log(`📥 Injected ${field} into UI: ${value}`);
        }
      } catch (error) {
        console.log(`⚠️ Failed to inject ${field}: ${error.message}`);
      }
    }
  }

  // Generate API test report
  generateAPIReport() {
    const report = {
      summary: {
        total: this.apiResults.length,
        passed: this.apiResults.filter(r => r.status === 'PASSED').length,
        failed: this.apiResults.filter(r => r.status === 'FAILED').length,
        totalDuration: this.apiResults.reduce((sum, r) => sum + r.duration, 0)
      },
      results: this.apiResults,
      cookies: this.cookies,
      authTokens: Object.keys(this.authTokens),
      generatedAt: new Date().toISOString()
    };

    return report;
  }

  // Save API test results
  saveAPIResults(filename) {
    const report = this.generateAPIReport();
    const filePath = path.join(process.cwd(), filename);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    console.log(`✅ API test results saved to: ${filePath}`);
    return filePath;
  }

  // Reset state for new test session
  reset() {
    this.apiResults = [];
    this.cookies = {};
    this.authTokens = {};
    console.log('🔄 API tester state reset');
  }
}

module.exports = APIIntegrationTester;