const fs = require('fs');
const path = require('path');

class IntelligentTestGenerator {
  constructor() {
    this.nlpPatterns = {
      navigation: {
        patterns: ['navigate to', 'go to', 'visit', 'open'],
        action: 'navigate',
        elementType: null
      },
      input: {
        patterns: ['fill', 'enter', 'type', 'input'],
        action: 'fill',
        elementTypes: {
          'username': ['username', 'user', 'email', 'login'],
          'password': ['password', 'pass', 'pwd'],
          'text': ['text', 'name', 'field']
        }
      },
      click: {
        patterns: ['click', 'press', 'tap', 'select'],
        action: 'click',
        elementTypes: {
          'button': ['button', 'btn', 'submit', 'login', 'sign in'],
          'link': ['link', 'anchor', 'href'],
          'checkbox': ['checkbox', 'check', 'tick'],
          'radio': ['radio', 'option']
        }
      },
      verify: {
        patterns: ['verify', 'check', 'assert', 'validate', 'ensure'],
        action: 'verify',
        elementTypes: {
          'text': ['text', 'message', 'content'],
          'element': ['element', 'component', 'section'],
          'page': ['page', 'dashboard', 'home']
        }
      }
    };
    
    this.pageObjects = new Map();
    this.testDataTemplates = {
      login: {
        username: ['admin', 'user123', 'testuser', 'demo'],
        password: ['password123', 'admin123', 'test123', 'demo123'],
        email: ['test@example.com', 'admin@test.com', 'user@demo.com']
      },
      registration: {
        firstName: ['John', 'Jane', 'Test', 'Demo'],
        lastName: ['Doe', 'Smith', 'User', 'Account'],
        email: ['john.doe@test.com', 'jane.smith@demo.com'],
        phone: ['1234567890', '9876543210', '5555555555']
      },
      ecommerce: {
        productName: ['Test Product', 'Demo Item', 'Sample Product'],
        quantity: [1, 2, 5, 10],
        price: [10.99, 25.50, 99.99, 199.99]
      }
    };
  }

  // Natural Language Processing - Convert plain English to test steps
  parseNaturalLanguage(description) {
    const sentences = description.split(/[.!?]+/).filter(s => s.trim());
    const testSteps = [];
    let stepNumber = 1;

    for (const sentence of sentences) {
      const cleanSentence = sentence.trim().toLowerCase();
      const step = this.extractStepFromSentence(cleanSentence, stepNumber);
      
      if (step) {
        testSteps.push(step);
        stepNumber++;
      }
    }

    return testSteps;
  }

  extractStepFromSentence(sentence, stepNumber) {
    // Check for navigation patterns
    for (const pattern of this.nlpPatterns.navigation.patterns) {
      if (sentence.includes(pattern)) {
        const urlMatch = sentence.match(/https?:\/\/[^\s]+/) || sentence.match(/www\.[^\s]+/);
        return {
          step: stepNumber,
          action: 'Navigate to URL',
          url: urlMatch ? urlMatch[0] : 'URL_PLACEHOLDER',
          description: sentence
        };
      }
    }

    // Check for input patterns
    for (const pattern of this.nlpPatterns.input.patterns) {
      if (sentence.includes(pattern)) {
        const elementType = this.detectElementType(sentence, this.nlpPatterns.input.elementTypes);
        const value = this.extractValue(sentence);
        
        return {
          step: stepNumber,
          action: `Fill ${elementType} field`,
          elementType: elementType,
          value: value || 'VALUE_PLACEHOLDER',
          description: sentence
        };
      }
    }

    // Check for click patterns
    for (const pattern of this.nlpPatterns.click.patterns) {
      if (sentence.includes(pattern)) {
        const elementType = this.detectElementType(sentence, this.nlpPatterns.click.elementTypes);
        
        return {
          step: stepNumber,
          action: `Click ${elementType}`,
          elementType: elementType === 'button' ? 'loginButton' : elementType,
          description: sentence
        };
      }
    }

    // Check for verification patterns
    for (const pattern of this.nlpPatterns.verify.patterns) {
      if (sentence.includes(pattern)) {
        return {
          step: stepNumber,
          action: 'Verify successful action',
          elementType: 'successIndicator',
          description: sentence
        };
      }
    }

    return null;
  }

  detectElementType(sentence, elementTypes) {
    for (const [type, keywords] of Object.entries(elementTypes)) {
      for (const keyword of keywords) {
        if (sentence.includes(keyword)) {
          return type;
        }
      }
    }
    return 'element';
  }

  extractValue(sentence) {
    // Extract quoted values
    const quotedMatch = sentence.match(/["'](.*?)["']/);
    if (quotedMatch) return quotedMatch[1];
    
    // Extract common patterns
    const patterns = [
      /with\s+([^\s]+)/,
      /as\s+([^\s]+)/,
      /value\s+([^\s]+)/
    ];
    
    for (const pattern of patterns) {
      const match = sentence.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  // Page Object Model Auto-Generation
  generatePageObject(pageName, elements) {
    const className = this.toPascalCase(pageName) + 'Page';
    const pageObject = {
      className: className,
      elements: {},
      methods: {}
    };

    // Generate element selectors
    for (const [elementName, selector] of Object.entries(elements)) {
      pageObject.elements[elementName] = {
        selector: selector,
        type: this.detectElementTypeFromSelector(selector)
      };
    }

    // Generate common methods
    pageObject.methods = this.generateCommonMethods(pageObject.elements);
    
    this.pageObjects.set(pageName, pageObject);
    return pageObject;
  }

  detectElementTypeFromSelector(selector) {
    if (selector.includes('input[type="password"]') || selector.includes('password')) return 'password';
    if (selector.includes('input[type="email"]') || selector.includes('email')) return 'email';
    if (selector.includes('input') || selector.includes('text')) return 'input';
    if (selector.includes('button') || selector.includes('btn')) return 'button';
    if (selector.includes('a[') || selector.includes('link')) return 'link';
    return 'element';
  }

  generateCommonMethods(elements) {
    const methods = {};
    
    for (const [elementName, elementData] of Object.entries(elements)) {
      const methodName = this.toCamelCase(elementName);
      
      switch (elementData.type) {
        case 'input':
        case 'password':
        case 'email':
          methods[`fill${this.toPascalCase(elementName)}`] = {
            action: 'fill',
            selector: elementData.selector,
            description: `Fill ${elementName} field`
          };
          break;
        case 'button':
        case 'link':
          methods[`click${this.toPascalCase(elementName)}`] = {
            action: 'click',
            selector: elementData.selector,
            description: `Click ${elementName}`
          };
          break;
        default:
          methods[`verify${this.toPascalCase(elementName)}`] = {
            action: 'verify',
            selector: elementData.selector,
            description: `Verify ${elementName} is visible`
          };
      }
    }
    
    return methods;
  }

  // Smart Test Data Management
  generateTestData(testType, customData = {}) {
    const baseData = this.testDataTemplates[testType] || {};
    const generatedData = {};
    
    for (const [field, values] of Object.entries(baseData)) {
      if (customData[field]) {
        generatedData[field] = customData[field];
      } else {
        generatedData[field] = this.getRandomValue(values);
      }
    }
    
    // Add timestamp for uniqueness
    const timestamp = Date.now();
    if (generatedData.email) {
      generatedData.email = generatedData.email.replace('@', `+${timestamp}@`);
    }
    if (generatedData.username) {
      generatedData.username += timestamp.toString().slice(-4);
    }
    
    return { ...generatedData, ...customData };
  }

  getRandomValue(values) {
    return values[Math.floor(Math.random() * values.length)];
  }

  // API Integration Testing
  generateAPITestSteps(apiEndpoints) {
    const apiSteps = [];
    let stepNumber = 1;
    
    for (const endpoint of apiEndpoints) {
      apiSteps.push({
        step: stepNumber++,
        action: 'API Request',
        method: endpoint.method || 'GET',
        url: endpoint.url,
        headers: endpoint.headers || {},
        body: endpoint.body || null,
        expectedStatus: endpoint.expectedStatus || 200,
        validation: endpoint.validation || []
      });
    }
    
    return apiSteps;
  }

  // Utility methods
  toPascalCase(str) {
    return str.replace(/(?:^|\s)\w/g, match => match.toUpperCase()).replace(/\s/g, '');
  }

  toCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }

  // Generate complete test case from natural language
  generateCompleteTestCase(description, options = {}) {
    const testSteps = this.parseNaturalLanguage(description);
    const testData = this.generateTestData(options.testType || 'login', options.customData || {});
    
    // Auto-fill placeholders with generated test data
    for (const step of testSteps) {
      if (step.value === 'VALUE_PLACEHOLDER') {
        if (step.elementType === 'username') {
          step.value = testData.username || testData.email || 'testuser';
        } else if (step.elementType === 'password') {
          step.value = testData.password || 'password123';
        }
      }
      if (step.url === 'URL_PLACEHOLDER') {
        step.url = options.baseUrl || 'https://example.com';
      }
    }
    
    return {
      test_case_id: options.testCaseId || 'GeneratedTest',
      description: description,
      test_steps: testSteps,
      test_data: testData,
      generated_at: new Date().toISOString()
    };
  }

  // Save generated test case to file
  saveTestCase(testCase, filename) {
    const filePath = path.join(process.cwd(), filename);
    fs.writeFileSync(filePath, JSON.stringify(testCase, null, 2));
    console.log(`✅ Test case saved to: ${filePath}`);
    return filePath;
  }

  // Export page objects to file
  exportPageObjects(filename) {
    const pageObjectsData = {};
    for (const [pageName, pageObject] of this.pageObjects) {
      pageObjectsData[pageName] = pageObject;
    }
    
    const filePath = path.join(process.cwd(), filename);
    fs.writeFileSync(filePath, JSON.stringify(pageObjectsData, null, 2));
    console.log(`✅ Page objects exported to: ${filePath}`);
    return filePath;
  }
}

module.exports = IntelligentTestGenerator;