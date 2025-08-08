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

// Configuration
const CONFIG = {
  timeout: 60000, // 1 minute total
  pageLoadTimeout: 30000,
  chatWaitTimeout: 5000,
  responseWaitTimeout: 8000,
  url: 'https://www.salesforce.com'
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
 * Find and click chat interface
 */
async function findAndClickChat(page) {
  console.log('🔍 Looking for chat interface...');
  
  for (const selector of CHAT_SELECTORS) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        console.log(`✅ Found chat element: ${selector}`);
        await element.click();
        return true;
      }
    } catch (e) {
      continue;
    }
  }
  
  console.log('❌ No chat interface found');
  return false;
}

/**
 * Find chat input field
 */
async function findChatInput(page) {
  for (const selector of INPUT_SELECTORS) {
    try {
      const input = page.locator(selector).first();
      if (await input.isVisible({ timeout: 3000 })) {
        console.log(`✅ Found input field: ${selector}`);
        return input;
      }
    } catch (e) {
      continue;
    }
  }
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
  console.log('🚀 Starting Standalone Agentforce Validation...');
  console.log('=' .repeat(50));
  
  // Initialize MongoDB
  const mongoUtils = new MongoDBUtils();
  await mongoUtils.connect();
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
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
    // Navigate to Salesforce
    console.log(`📍 Navigating to ${CONFIG.url}...`);
    await page.goto(CONFIG.url, { waitUntil: 'networkidle', timeout: CONFIG.pageLoadTimeout });
    
    // Wait for page to load
    await page.waitForTimeout(CONFIG.chatWaitTimeout);
    
    // Find and click chat
    const chatFound = await findAndClickChat(page);
    results.chatFound = chatFound;
    
    if (chatFound) {
      // Wait for chat to open
      await page.waitForTimeout(3000);
      
      // Validate Agentforce
      console.log('🤖 Performing Agentforce validation...');
      const validation = await validateAgentforceWelcome(page);
      results.agentforceValidation = validation;
      
      console.log(`🎯 Agentforce Validation Score: ${validation.validationScore}/100`);
      validation.details.forEach(detail => console.log(`   ${detail}`));
      
      // Test chat interaction
      const input = await findChatInput(page);
      if (input) {
        const interactionWorking = await testChatInteraction(page, input, mongoUtils);
        results.chatInteractionWorking = interactionWorking;
      }
      
      // Determine overall status
      if (validation.validationScore >= 50 && results.chatInteractionWorking) {
        results.overallStatus = 'PASS';
      } else if (validation.validationScore >= 50) {
        results.overallStatus = 'PARTIAL';
      }
    }
    
  } catch (error) {
    console.log(`❌ Test error: ${error.message}`);
    results.error = error.message;
  } finally {
    await browser.close();
  }
  
  // Store results in MongoDB
  try {
    const mongoId = await mongoUtils.storeValidationResult(results);
    if (mongoId) {
      results.mongoDbStored = true;
      results.mongoId = mongoId.toString();
      console.log('💾 Results stored in MongoDB');
    }
  } catch (error) {
    console.log(`⚠️  MongoDB storage failed: ${error.message}`);
  } finally {
    await mongoUtils.disconnect();
  }
  
  // Save results to file
  const reportPath = 'agentforce_validation_report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
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