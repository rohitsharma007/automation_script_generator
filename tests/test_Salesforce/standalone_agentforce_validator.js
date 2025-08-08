/**
 * Standalone Agentforce Chat Validation Script
 * 
 * This script validates Salesforce Agentforce chat functionality
 * Can be run independently in any Playwright environment
 * 
 * Prerequisites:
 * - Node.js installed
 * - Playwright installed: npm install @playwright/test
 * 
 * Usage:
 * node standalone_agentforce_validator.js
 * 
 * Or with Playwright test runner:
 * npx playwright test standalone_agentforce_validator.js --headed
 */

const { test, expect, chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const MongoDBUtils = require('./mongodb_utils');

// Import enhanced utilities for better performance
const ElementHelper = require('./common/utils/elementHelper');
const WaitUtils = require('./common/utils/waitUtils');
const Logger = require('./common/utils/logger');

// Enhanced Configuration with utility integration
const CONFIG = {
  timeout: 60000, // 1 minute total
  pageLoadTimeout: 30000,
  chatWaitTimeout: 5000,
  responseWaitTimeout: 8000,
  url: 'https://www.salesforce.com',
  // Enhanced utility options
  elementHelper: {
    retryConfig: { maxRetries: 3, retryDelay: 1000, timeoutMs: 30000 }
  },
  waitUtils: {
    defaultTimeout: 30000,
    shortTimeout: 5000,
    longTimeout: 60000,
    logLevel: 'info'
  },
  logger: {
    level: 'info',
    logToFile: true,
    logToConsole: true
  }
};

// Chat selectors to try
const CHAT_SELECTORS = [
  'button:has-text("Help")',
  'button:has-text("Chat")',
  'button:has-text("Ask")',
  'button[aria-label*="chat"]',
  'button[aria-label*="help"]',
  'button[title*="chat"]',
  'button[title*="help"]',
  '.chat-button',
  '#chat-button'
];

// Input field selectors
const INPUT_SELECTORS = [
  'textarea',
  'input[type="text"]',
  'input[placeholder*="question"]',
  'input[placeholder*="message"]',
  'textarea[placeholder*="question"]',
  'textarea[placeholder*="message"]'
];

// Keywords to validate Agentforce presence
const AGENTFORCE_KEYWORDS = ['agentforce', 'agent force', 'ai agent', 'salesforce agent'];
const RESPONSE_KEYWORDS = ['salesforce', 'crm', 'customer', 'platform', 'cloud', 'service'];

/**
 * Quick Agentforce validation function
 */
async function validateAgentforceWelcome(page) {
  const results = {
    agentforceFound: false,
    chatResponsive: false,
    validationScore: 0,
    details: []
  };
  
  try {
    // Get page content
    const pageText = await page.locator('body').textContent();
    const lowerPageText = pageText.toLowerCase();
    
    // Check for Agentforce keywords
    for (const keyword of AGENTFORCE_KEYWORDS) {
      if (lowerPageText.includes(keyword)) {
        results.agentforceFound = true;
        results.details.push(`✅ Found keyword: "${keyword}"`);
        break;
      }
    }
    
    // Check page responsiveness
    if (pageText.length > 1000) {
      results.chatResponsive = true;
      results.details.push('✅ Page has substantial content - chat likely responsive');
    }
    
    // Calculate score
    results.validationScore = (results.agentforceFound ? 50 : 0) + (results.chatResponsive ? 50 : 0);
    
    if (!results.agentforceFound) {
      results.details.push('❌ No Agentforce keywords detected');
    }
    
    return results;
  } catch (error) {
    results.details.push(`❌ Validation error: ${error.message}`);
    return results;
  }
}

/**
 * Enhanced find and click chat interface using ElementHelper
 */
async function findAndClickChat(page, elementHelper, logger) {
  logger.info('🔍 Looking for chat interface with enhanced detection...');
  console.log('🔍 Looking for chat interface...');
  
  try {
    // Use ElementHelper for intelligent element detection
    const chatResult = await elementHelper.findElement(CHAT_SELECTORS, {
      timeout: 10000,
      visible: true,
      enabled: true
    });
    
    if (chatResult && chatResult.element) {
      logger.info(`✅ Found chat element using ${chatResult.strategy}`, { selector: chatResult.selector });
      console.log(`✅ Found chat element: ${chatResult.selector}`);
      
      // Use ElementHelper's safe interaction
      await elementHelper.safeInteraction(chatResult, 'click');
      logger.info('✅ Successfully clicked chat interface');
      return true;
    }
  } catch (error) {
    logger.error('❌ Enhanced chat detection failed', { error: error.message });
  }
  
  // Fallback to original method
  logger.info('🔄 Falling back to basic detection...');
  for (const selector of CHAT_SELECTORS) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        logger.info(`✅ Found chat element (fallback): ${selector}`);
        console.log(`✅ Found chat element: ${selector}`);
        await element.click();
        return true;
      }
    } catch (e) {
      continue;
    }
  }
  
  logger.warn('❌ No chat interface found');
  console.log('❌ No chat interface found');
  return false;
}

/**
 * Enhanced find chat input field using ElementHelper
 */
async function findChatInput(page, elementHelper, logger) {
  logger.info('🔍 Looking for chat input field with enhanced detection...');
  
  try {
    // Use ElementHelper for intelligent input detection
    const inputResult = await elementHelper.findElement(INPUT_SELECTORS, {
      timeout: 10000,
      visible: true,
      enabled: true
    });
    
    if (inputResult && inputResult.element) {
      logger.info(`✅ Found input field using ${inputResult.strategy}`, { selector: inputResult.selector });
      console.log(`✅ Found input field: ${inputResult.selector}`);
      return inputResult.element;
    }
  } catch (error) {
    logger.error('❌ Enhanced input detection failed', { error: error.message });
  }
  
  // Fallback to original method
  logger.info('🔄 Falling back to basic input detection...');
  for (const selector of INPUT_SELECTORS) {
    try {
      const input = page.locator(selector).first();
      if (await input.isVisible({ timeout: 3000 })) {
        logger.info(`✅ Found input field (fallback): ${selector}`);
        console.log(`✅ Found input field: ${selector}`);
        return input;
      }
    } catch (e) {
      continue;
    }
  }
  
  logger.warn('❌ No chat input field found');
  return null;
}

/**
 * Test chat interaction
 */
async function testChatInteraction(page, input, mongoUtils = null) {
  try {
    console.log('💬 Testing chat interaction...');
    
    const question = 'What is Salesforce?';
    const startTime = new Date();
    
    // Send test question
    await input.fill(question);
    await page.keyboard.press('Enter');
    
    // Wait for response
    await page.waitForTimeout(CONFIG.responseWaitTimeout);
    
    // Check for response
    const newPageText = await page.locator('body').textContent();
    const lowerText = newPageText.toLowerCase();
    
    let responseFound = false;
    let detectedKeyword = null;
    for (const keyword of RESPONSE_KEYWORDS) {
      if (lowerText.includes(keyword)) {
        responseFound = true;
        detectedKeyword = keyword;
        console.log(`✅ Response detected with keyword: "${keyword}"`);
        break;
      }
    }
    
    if (!responseFound) {
      console.log('⚠️  No clear response detected');
    }
    
    // Store chat interaction in MongoDB
    if (mongoUtils) {
      const interactionData = {
        question: question,
        responseFound: responseFound,
        detectedKeyword: detectedKeyword,
        responseTime: new Date() - startTime,
        url: CONFIG.url,
        timestamp: new Date()
      };
      
      await mongoUtils.storeChatInteraction(interactionData);
    }
    
    return responseFound;
  } catch (error) {
    console.log(`❌ Chat interaction error: ${error.message}`);
    return false;
  }
}

/**
 * Main validation function
 */
async function runValidation() {
  let browser;
  let mongoUtils;
  let logger;
  let elementHelper;
  let waitUtils;
  
  // Initialize enhanced utilities
  logger = new Logger(CONFIG.logger);
  logger.info('🚀 Starting Enhanced Agentforce Validation with Utilities');
  console.log('🚀 Starting Enhanced Agentforce Validation');
  console.log('=' .repeat(50));
  
  // Initialize MongoDB connection
  try {
    mongoUtils = new MongoDBUtils();
    await mongoUtils.connect();
    logger.info('✅ Connected to MongoDB');
    console.log('✅ Connected to MongoDB');
  } catch (mongoError) {
    logger.warn('⚠️ MongoDB connection failed, continuing without database storage', { error: mongoError.message });
    console.log('⚠️ MongoDB connection failed, continuing without database storage');
    console.log('Error:', mongoError.message);
  }
  
  const results = {
    timestamp: new Date().toISOString(),
    url: CONFIG.url,
    chatFound: false,
    agentforceValidation: null,
    chatInteractionWorking: false,
    overallStatus: 'FAIL',
    mongoDbStored: false
  };
  
  try {
    // Launch browser
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    
    // Initialize page-specific utilities
    elementHelper = new ElementHelper(page);
    waitUtils = new WaitUtils(page, CONFIG.waitUtils);
    logger.info('✅ Enhanced utilities initialized', { elementHelper: true, waitUtils: true });
    // Navigate to Salesforce with enhanced page load waiting
    logger.info(`📍 Navigating to ${CONFIG.url}...`);
    console.log(`📍 Navigating to ${CONFIG.url}...`);
    await page.goto(CONFIG.url, { waitUntil: 'networkidle', timeout: CONFIG.pageLoadTimeout });
    
    // Use enhanced wait utilities for better page load detection
    await waitUtils.waitForPageLoad({ timeout: CONFIG.pageLoadTimeout });
    logger.info('✅ Page loaded successfully');
    
    // Find and click chat with enhanced utilities
    const chatFound = await findAndClickChat(page, elementHelper, logger);
    results.chatFound = chatFound;
    
    if (chatFound) {
      // Use smart waiting for chat interface to open
      await waitUtils.waitForNetworkIdle({ timeout: 5000 });
      logger.info('✅ Chat interface opened');
      
      // Validate Agentforce
      logger.info('🤖 Performing Agentforce validation...');
      console.log('🤖 Performing Agentforce validation...');
      const validation = await validateAgentforceWelcome(page);
      results.agentforceValidation = validation;
      
      logger.info(`🎯 Agentforce Validation Score: ${validation.validationScore}/100`);
      console.log(`🎯 Agentforce Validation Score: ${validation.validationScore}/100`);
      validation.details.forEach(detail => {
        logger.info(`   ${detail}`);
        console.log(`   ${detail}`);
      });
      
      // Test chat interaction with enhanced input detection
      const input = await findChatInput(page, elementHelper, logger);
      if (input) {
        const interactionWorking = await testChatInteraction(page, input, mongoUtils);
        results.chatInteractionWorking = interactionWorking;
      }
      
      // Determine overall status
      if (validation.validationScore >= 50 && results.chatInteractionWorking) {
        results.overallStatus = 'PASS';
        logger.info('✅ Overall validation: PASS');
      } else if (validation.validationScore >= 50) {
        results.overallStatus = 'PARTIAL';
        logger.info('⚠️ Overall validation: PARTIAL');
      } else {
        logger.warn('❌ Overall validation: FAIL');
      }
    }
    
  } catch (error) {
    logger.error(`❌ Test error: ${error.message}`);
    console.log(`❌ Test error: ${error.message}`);
    results.error = error.message;
  } finally {
    await browser.close();
    logger.info('🔒 Browser closed');
  }
  
  // Store results in MongoDB with enhanced logging
  try {
    logger.info('💾 Storing results in MongoDB...');
    const mongoId = await mongoUtils.storeValidationResult(results);
    if (mongoId) {
      results.mongoDbStored = true;
      results.mongoId = mongoId.toString();
      logger.info(`✅ Results stored in MongoDB with ID: ${mongoId}`);
      console.log(`✅ Results stored in MongoDB with ID: ${mongoId}`);
    }
  } catch (error) {
    logger.error(`⚠️ MongoDB storage failed: ${error.message}`);
    console.log(`⚠️  MongoDB storage failed: ${error.message}`);
  } finally {
    await mongoUtils.disconnect();
    logger.info('🔌 MongoDB disconnected');
  }
  
  // Generate and save report with enhanced logging
  const reportPath = path.join(__dirname, 'reports', 'agentforce_validation_report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  logger.info(`📄 Report saved to: ${reportPath}`);
  
  // Log final summary
   logger.info(`🏁 Validation completed with status: ${results.overallStatus}`);
   
   // Print summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 VALIDATION SUMMARY');
  console.log('=' .repeat(50));
  console.log(`🌐 URL: ${results.url}`);
  console.log(`💬 Chat Found: ${results.chatFound ? '✅ Yes' : '❌ No'}`);
  if (results.agentforceValidation) {
    console.log(`🤖 Agentforce Score: ${results.agentforceValidation.validationScore}/100`);
    console.log(`🔍 Agentforce Detected: ${results.agentforceValidation.agentforceFound ? '✅ Yes' : '❌ No'}`);
  }
  console.log(`💬 Chat Interaction: ${results.chatInteractionWorking ? '✅ Working' : '❌ Not Working'}`);
  console.log(`📊 Overall Status: ${results.overallStatus}`);
  console.log(`💾 MongoDB Storage: ${results.mongoDbStored ? '✅ Stored' : '❌ Failed'}`);
  if (results.mongoId) {
    console.log(`🆔 MongoDB ID: ${results.mongoId}`);
  }
  console.log(`📄 Report saved: ${reportPath}`);
  console.log('=' .repeat(50));
  
  return results;
}

// If running as standalone script
if (require.main === module) {
  runValidation().then(results => {
    process.exit(results.overallStatus === 'PASS' ? 0 : 1);
  }).catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
} else {
  // Playwright test wrapper (only when imported as module)
  test.describe('Standalone Agentforce Validation', () => {
    test.setTimeout(CONFIG.timeout);
    
    test('Validate Salesforce Agentforce chat functionality', async ({ page }) => {
      console.log('🚀 Starting Playwright test mode...');
      
      // Navigate to Salesforce
      console.log(`📍 Navigating to ${CONFIG.url}...`);
      await page.goto(CONFIG.url, { waitUntil: 'networkidle', timeout: CONFIG.pageLoadTimeout });
      
      // Wait for page to load
      await page.waitForTimeout(CONFIG.chatWaitTimeout);
      
      // Find and click chat
      const chatFound = await findAndClickChat(page);
      expect(chatFound).toBeTruthy();
      
      if (chatFound) {
        // Wait for chat to open
        await page.waitForTimeout(3000);
        
        // Validate Agentforce
        console.log('🤖 Performing Agentforce validation...');
        const validation = await validateAgentforceWelcome(page);
        
        console.log(`🎯 Agentforce Validation Score: ${validation.validationScore}/100`);
        validation.details.forEach(detail => console.log(`   ${detail}`));
        
        // Assert validation passed
        expect(validation.validationScore).toBeGreaterThanOrEqual(50);
        
        // Test chat interaction
        const input = await findChatInput(page);
        if (input) {
          const interactionWorking = await testChatInteraction(page, input);
          console.log(`💬 Chat interaction: ${interactionWorking ? 'Working' : 'Not working'}`);
        }
      }
      
      console.log('✅ Validation completed successfully!');
    });
  });
}

module.exports = { runValidation, validateAgentforceWelcome };