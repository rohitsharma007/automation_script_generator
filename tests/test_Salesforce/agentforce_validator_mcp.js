/**
 * Enhanced Salesforce Agentforce Validator with Playwright MCP Integration
 * Combines intelligent element detection with MongoDB storage capabilities
 * Author: AI Assistant
 * Version: 2.0.0
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');
const MongoDBUtils = require('./mongodb_utils');

// Import Smart Element Detector from core framework
const SmartElementDetector = require('../../core_framework/utils/smart_element_detector');

class AgentforceMCPValidator {
  constructor(config = {}) {
    this.config = {
      url: 'https://www.salesforce.com',
      browsers: ['chromium'], // Can test across multiple browsers
      headless: false,
      viewport: { width: 1280, height: 720 },
      timeout: 30000,
      chatTimeout: 60000,
      questions: [
        "What is Salesforce?",
        "Tell me about Agentforce",
        "How can I get started with Salesforce?"
      ],
      expectedKeywords: ['salesforce', 'agentforce', 'crm', 'cloud', 'platform'],
      ...config
    };
    
    this.contexts = [];
    this.pages = [];
    this.testResults = [];
    this.stepLogs = [];
    this.mongoUtils = null;
    this.smartDetector = null;
  }

  async setup() {
    console.log('🎭 Setting up Enhanced Agentforce MCP Validator...');
    
    // Create test folders
    const folders = ['screenshots', 'logs', 'reports', 'traces'];
    folders.forEach(folder => {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }
    });

    // Initialize MongoDB if configured
    try {
      this.mongoUtils = new MongoDBUtils();
      await this.mongoUtils.connect();
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.log('⚠️ MongoDB connection failed, continuing without database storage:', error.message);
      this.mongoUtils = null;
    }

    // Launch browsers and create contexts
    for (const browserType of this.config.browsers) {
      const browser = await this.launchBrowser(browserType);
      const context = await browser.newContext({
        viewport: this.config.viewport,
        recordVideo: { dir: 'videos/' },
        recordHar: { path: `har-files/${browserType}-session.har` }
      });
      
      // Enable tracing for debugging
      await context.tracing.start({ screenshots: true, snapshots: true });
      
      const page = await context.newPage();
      
      // Initialize Smart Element Detector for this page
      this.smartDetector = new SmartElementDetector(page);
      
      this.contexts.push({ browser, context, page, browserType });
      this.pages.push(page);
    }
  }

  async launchBrowser(browserType) {
    const browsers = { chromium, firefox, webkit };
    return await browsers[browserType].launch({
      headless: this.config.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async runValidation() {
    console.log('🚀 Starting Enhanced Agentforce Validation with MCP Intelligence...');
    
    const results = {
      timestamp: new Date().toISOString(),
      url: this.config.url,
      browsers: this.config.browsers,
      mongoDbStored: false,
      mongoId: null,
      overallScore: 0,
      status: 'FAIL',
      browserResults: [],
      chatInteractions: [],
      intelligentDetections: [],
      performanceMetrics: {}
    };

    try {
      // Run validation across all browser contexts
      for (const { page, browserType, context } of this.contexts) {
        console.log(`\n🌐 Testing with ${browserType}...`);
        
        const browserResult = await this.runBrowserValidation(page, browserType);
        results.browserResults.push(browserResult);
        
        // Collect intelligent detection data
        if (this.smartDetector) {
          const detectionData = await this.collectDetectionData(browserType);
          results.intelligentDetections.push(detectionData);
        }
        
        // Stop tracing and save
        await context.tracing.stop({ path: `traces/${browserType}-trace.zip` });
      }

      // Calculate overall score
      results.overallScore = this.calculateOverallScore(results.browserResults);
      results.status = results.overallScore >= 70 ? 'PASS' : 'FAIL';
      
      // Store in MongoDB if available
      if (this.mongoUtils) {
        try {
          const mongoResult = await this.mongoUtils.storeValidationResult(results);
          results.mongoDbStored = true;
          results.mongoId = mongoResult.insertedId;
          console.log('✅ Validation results stored in MongoDB:', mongoResult.insertedId);
        } catch (error) {
          console.log('⚠️ Failed to store in MongoDB:', error.message);
        }
      }

      // Generate enhanced report
      await this.generateEnhancedReport(results);
      
      return results;
      
    } catch (error) {
      console.error('❌ Validation failed:', error);
      results.error = error.message;
      return results;
    } finally {
      await this.cleanup();
    }
  }

  async runBrowserValidation(page, browserType) {
    const startTime = Date.now();
    const result = {
      browser: browserType,
      timestamp: new Date().toISOString(),
      navigationSuccess: false,
      chatInterfaceFound: false,
      agentforceDetected: false,
      chatInteractions: [],
      performanceMetrics: {},
      score: 0,
      errors: []
    };

    try {
      // Step 1: Navigate with intelligent loading detection
      console.log(`📍 Navigating to ${this.config.url}...`);
      await page.goto(this.config.url, { waitUntil: 'networkidle' });
      result.navigationSuccess = true;
      
      // Take screenshot
      await page.screenshot({ path: `screenshots/${browserType}-homepage.png` });
      
      // Step 2: Intelligent chat interface detection
      console.log('🔍 Using smart detection for chat interface...');
      const chatInterface = await this.detectChatInterface(page);
      
      if (chatInterface) {
        result.chatInterfaceFound = true;
        console.log(`✅ Chat interface detected: ${chatInterface.selector}`);
        
        // Step 3: Test Agentforce with intelligent interaction
        const agentforceResult = await this.testAgentforceIntelligent(page, browserType);
        result.agentforceDetected = agentforceResult.detected;
        result.chatInteractions = agentforceResult.interactions;
        
        // Learn from successful detections
        if (this.smartDetector && chatInterface.element) {
          await this.smartDetector.learnFromSuccess('chatInterface', chatInterface.selector, {
            url: page.url(),
            browserType,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // Calculate performance metrics
      result.performanceMetrics = await this.collectPerformanceMetrics(page);
      
      // Calculate score
      result.score = this.calculateBrowserScore(result);
      
    } catch (error) {
      console.error(`❌ Error in ${browserType}:`, error.message);
      result.errors.push(error.message);
    }
    
    const endTime = Date.now();
    result.executionTime = endTime - startTime;
    
    return result;
  }

  async detectChatInterface(page) {
    console.log('🎯 Using intelligent chat interface detection...');
    
    // Define chat interface patterns for smart detection
    const chatPatterns = {
      chatInterface: {
        selectors: [
          '.chat-widget', '.chat-button', '.chat-launcher', '.help-widget',
          '[data-chat]', '[data-widget="chat"]', '.support-chat',
          '#chat-widget', '#chat-button', '.live-chat'
        ],
        attributes: ['chat', 'widget', 'support', 'help', 'assistant'],
        text: ['chat', 'help', 'support', 'ask', 'assistant', 'talk'],
        classes: ['chat', 'widget', 'support', 'help', 'assistant', 'bot']
      }
    };
    
    // Add chat patterns to smart detector
    if (this.smartDetector) {
      this.smartDetector.elementPatterns.chatInterface = chatPatterns.chatInterface;
      
      try {
        const detection = await this.smartDetector.detectElement('chatInterface');
        if (detection) {
          return detection;
        }
      } catch (error) {
        console.log('⚠️ Smart detection failed, trying fallback methods...');
      }
    }
    
    // Fallback: Manual detection with multiple strategies
    const fallbackSelectors = [
      '.chat-widget', '.chat-button', '.help-widget',
      '[aria-label*="chat"]', '[aria-label*="help"]',
      'button:has-text("Chat")', 'button:has-text("Help")',
      '.slds-chat', '.salesforce-chat'
    ];
    
    for (const selector of fallbackSelectors) {
      try {
        const element = await page.$(selector);
        if (element && await element.isVisible()) {
          console.log(`✅ Fallback detection found chat interface: ${selector}`);
          return { element, selector };
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    return null;
  }

  async testAgentforceIntelligent(page, browserType) {
    const result = {
      detected: false,
      interactions: [],
      confidence: 0
    };
    
    try {
      // Find and click chat interface
      const chatInterface = await this.detectChatInterface(page);
      if (!chatInterface) {
        throw new Error('Chat interface not found');
      }
      
      await chatInterface.element.click();
      await page.waitForTimeout(3000); // Wait for chat to load
      
      // Intelligent detection of chat input and send button
      const chatInput = await this.detectChatInput(page);
      const sendButton = await this.detectSendButton(page);
      
      if (!chatInput) {
        throw new Error('Chat input field not detected');
      }
      
      // Test multiple questions with intelligent response analysis
      for (const question of this.config.questions) {
        const interaction = await this.performIntelligentChatInteraction(
          page, chatInput, sendButton, question, browserType
        );
        result.interactions.push(interaction);
        
        // Store in MongoDB if available
        if (this.mongoUtils && interaction.success) {
          try {
            await this.mongoUtils.storeChatInteraction({
              question: interaction.question,
              response: interaction.response,
              responseTime: interaction.responseTime,
              detectedKeyword: interaction.detectedKeyword,
              confidence: interaction.confidence,
              browser: browserType,
              url: page.url(),
              timestamp: new Date()
            });
          } catch (error) {
            console.log('⚠️ Failed to store chat interaction in MongoDB:', error.message);
          }
        }
      }
      
      // Calculate overall confidence
      const successfulInteractions = result.interactions.filter(i => i.success);
      result.detected = successfulInteractions.length > 0;
      result.confidence = successfulInteractions.length / result.interactions.length * 100;
      
    } catch (error) {
      console.error('❌ Agentforce testing failed:', error.message);
      result.error = error.message;
    }
    
    return result;
  }

  async detectChatInput(page) {
    if (this.smartDetector) {
      // Add chat input patterns
      this.smartDetector.elementPatterns.chatInput = {
        selectors: [
          'input[type="text"]', 'textarea', '.chat-input', '.message-input',
          '[placeholder*="message"]', '[placeholder*="question"]',
          '[aria-label*="message"]', '[aria-label*="chat"]'
        ],
        attributes: ['message', 'chat', 'input', 'question'],
        placeholders: ['type a message', 'ask a question', 'how can we help']
      };
      
      try {
        const detection = await this.smartDetector.detectElement('chatInput');
        if (detection) {
          return detection;
        }
      } catch (error) {
        console.log('⚠️ Smart chat input detection failed');
      }
    }
    
    // Fallback detection
    const selectors = ['input[type="text"]', 'textarea', '.chat-input'];
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element && await element.isVisible()) {
          return { element, selector };
        }
      } catch (error) {
        // Continue
      }
    }
    
    return null;
  }

  async detectSendButton(page) {
    if (this.smartDetector) {
      this.smartDetector.elementPatterns.sendButton = {
        selectors: [
          'button[type="submit"]', '.send-button', '.chat-send',
          '[aria-label*="send"]', 'button:has-text("Send")',
          '.submit-btn', '.message-send'
        ],
        text: ['send', 'submit', 'ask', 'go'],
        attributes: ['send', 'submit']
      };
      
      try {
        const detection = await this.smartDetector.detectElement('sendButton');
        if (detection) {
          return detection;
        }
      } catch (error) {
        console.log('⚠️ Smart send button detection failed');
      }
    }
    
    // Fallback detection
    const selectors = ['button[type="submit"]', '.send-button', 'button:has-text("Send")'];
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element && await element.isVisible()) {
          return { element, selector };
        }
      } catch (error) {
        // Continue
      }
    }
    
    return null;
  }

  async performIntelligentChatInteraction(page, chatInput, sendButton, question, browserType) {
    const startTime = Date.now();
    const interaction = {
      question,
      browser: browserType,
      timestamp: new Date().toISOString(),
      success: false,
      response: '',
      responseTime: 0,
      detectedKeyword: null,
      confidence: 0
    };
    
    try {
      console.log(`💬 Asking: "${question}"`);
      
      // Clear and type question
      await chatInput.element.fill('');
      await chatInput.element.fill(question);
      await page.waitForTimeout(1000);
      
      // Send message
      if (sendButton) {
        await sendButton.element.click();
      } else {
        await chatInput.element.press('Enter');
      }
      
      // Wait for response with intelligent detection
      const response = await this.waitForIntelligentResponse(page);
      
      if (response) {
        interaction.response = response.text;
        interaction.success = true;
        
        // Analyze response for keywords
        const keywordAnalysis = this.analyzeResponseKeywords(response.text);
        interaction.detectedKeyword = keywordAnalysis.keyword;
        interaction.confidence = keywordAnalysis.confidence;
        
        console.log(`✅ Response received (${response.text.length} chars)`);
        if (keywordAnalysis.keyword) {
          console.log(`🎯 Detected keyword: ${keywordAnalysis.keyword} (${keywordAnalysis.confidence}% confidence)`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Chat interaction failed: ${error.message}`);
      interaction.error = error.message;
    }
    
    interaction.responseTime = Date.now() - startTime;
    return interaction;
  }

  async waitForIntelligentResponse(page) {
    const responseSelectors = [
      '.chat-message', '.bot-message', '.response-message',
      '.assistant-message', '.ai-response', '.chat-response',
      '[data-message-type="bot"]', '[data-role="assistant"]'
    ];
    
    try {
      // Wait for any response element to appear
      await page.waitForFunction(() => {
        const selectors = [
          '.chat-message', '.bot-message', '.response-message',
          '.assistant-message', '.ai-response', '.chat-response'
        ];
        
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            const lastElement = elements[elements.length - 1];
            return lastElement.textContent.trim().length > 0;
          }
        }
        return false;
      }, {}, { timeout: this.config.chatTimeout });
      
      // Get the latest response
      for (const selector of responseSelectors) {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          const lastElement = elements[elements.length - 1];
          const text = await lastElement.textContent();
          if (text && text.trim().length > 0) {
            return { element: lastElement, text: text.trim() };
          }
        }
      }
      
    } catch (error) {
      console.log('⚠️ Response timeout or detection failed');
    }
    
    return null;
  }

  analyzeResponseKeywords(responseText) {
    const text = responseText.toLowerCase();
    let bestMatch = { keyword: null, confidence: 0 };
    
    for (const keyword of this.config.expectedKeywords) {
      if (text.includes(keyword.toLowerCase())) {
        const confidence = this.calculateKeywordConfidence(text, keyword);
        if (confidence > bestMatch.confidence) {
          bestMatch = { keyword, confidence };
        }
      }
    }
    
    return bestMatch;
  }

  calculateKeywordConfidence(text, keyword) {
    const keywordCount = (text.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    const textLength = text.split(' ').length;
    const baseConfidence = (keywordCount / textLength) * 100;
    
    // Boost confidence for exact matches and context
    let confidence = Math.min(baseConfidence * 10, 100);
    
    // Additional context-based scoring
    const contextWords = ['platform', 'solution', 'service', 'technology', 'software'];
    const contextMatches = contextWords.filter(word => text.includes(word)).length;
    confidence += contextMatches * 5;
    
    return Math.min(Math.round(confidence), 100);
  }

  async collectDetectionData(browserType) {
    if (!this.smartDetector) return null;
    
    return {
      browser: browserType,
      timestamp: new Date().toISOString(),
      successfulDetections: this.smartDetector.successfulDetections || [],
      learningData: this.smartDetector.learningData || {},
      confidenceScores: this.smartDetector.confidenceScores || {}
    };
  }

  async collectPerformanceMetrics(page) {
    try {
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        };
      });
      return metrics;
    } catch (error) {
      return {};
    }
  }

  calculateBrowserScore(result) {
    let score = 0;
    
    if (result.navigationSuccess) score += 20;
    if (result.chatInterfaceFound) score += 30;
    if (result.agentforceDetected) score += 40;
    
    // Bonus for successful interactions
    const successfulInteractions = result.chatInteractions.filter(i => i.success).length;
    score += (successfulInteractions / this.config.questions.length) * 10;
    
    return Math.min(score, 100);
  }

  calculateOverallScore(browserResults) {
    if (browserResults.length === 0) return 0;
    
    const totalScore = browserResults.reduce((sum, result) => sum + result.score, 0);
    return Math.round(totalScore / browserResults.length);
  }

  async generateEnhancedReport(results) {
    const reportPath = 'agentforce_mcp_validation_report.json';
    
    // Enhanced report with MCP intelligence data
    const enhancedReport = {
      ...results,
      mcpFeatures: {
        intelligentElementDetection: true,
        multiContextTesting: true,
        smartResponseAnalysis: true,
        learningCapabilities: true
      },
      summary: {
        totalBrowsers: results.browsers.length,
        successfulBrowsers: results.browserResults.filter(r => r.score >= 70).length,
        totalChatInteractions: results.browserResults.reduce((sum, r) => sum + r.chatInteractions.length, 0),
        successfulInteractions: results.browserResults.reduce((sum, r) => 
          sum + r.chatInteractions.filter(i => i.success).length, 0
        ),
        averageResponseTime: this.calculateAverageResponseTime(results.browserResults),
        intelligentDetections: results.intelligentDetections.length
      }
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(enhancedReport, null, 2));
    console.log(`\n📊 Enhanced MCP validation report saved: ${reportPath}`);
    
    // Console summary
    console.log('\n' + '='.repeat(60));
    console.log('🎭 ENHANCED AGENTFORCE MCP VALIDATION RESULTS');
    console.log('='.repeat(60));
    console.log(`🌐 Browsers Tested: ${results.browsers.join(', ')}`);
    console.log(`📊 Overall Score: ${results.overallScore}/100`);
    console.log(`✅ Status: ${results.status}`);
    console.log(`🤖 MongoDB Stored: ${results.mongoDbStored}`);
    if (results.mongoId) {
      console.log(`🆔 MongoDB ID: ${results.mongoId}`);
    }
    console.log(`🧠 Intelligent Detections: ${results.intelligentDetections.length}`);
    console.log(`💬 Total Chat Interactions: ${enhancedReport.summary.totalChatInteractions}`);
    console.log(`⚡ Average Response Time: ${enhancedReport.summary.averageResponseTime}ms`);
    console.log('='.repeat(60));
  }

  calculateAverageResponseTime(browserResults) {
    const allInteractions = browserResults.flatMap(r => r.chatInteractions);
    if (allInteractions.length === 0) return 0;
    
    const totalTime = allInteractions.reduce((sum, i) => sum + (i.responseTime || 0), 0);
    return Math.round(totalTime / allInteractions.length);
  }

  async cleanup() {
    console.log('🧹 Cleaning up resources...');
    
    for (const { browser } of this.contexts) {
      await browser.close();
    }
    
    if (this.mongoUtils) {
      await this.mongoUtils.disconnect();
    }
  }
}

// Export for use as module
module.exports = AgentforceMCPValidator;

// Run if called directly
if (require.main === module) {
  (async () => {
    const validator = new AgentforceMCPValidator({
      browsers: ['chromium'], // Can add 'firefox', 'webkit' for cross-browser testing
      headless: false, // Set to true for CI/CD
      questions: [
        "What is Salesforce?",
        "Tell me about Agentforce",
        "How can I get started with Salesforce?",
        "What are the benefits of using Salesforce?"
      ]
    });
    
    try {
      await validator.setup();
      const results = await validator.runValidation();
      
      console.log('\n🎉 Enhanced MCP Validation completed!');
      process.exit(results.status === 'PASS' ? 0 : 1);
      
    } catch (error) {
      console.error('💥 Validation failed:', error);
      process.exit(1);
    }
  })();
}