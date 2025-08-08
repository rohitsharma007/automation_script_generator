/**
 * MongoDB Connection Test Script
 * 
 * This script tests the MongoDB connection and basic operations
 * Run this before using the main validation script to ensure MongoDB is working
 * 
 * Usage: node test_mongodb.js
 */

const MongoDBUtils = require('./mongodb_utils');
require('dotenv').config();

async function testMongoDB() {
  console.log('🧪 Testing MongoDB Connection...');
  console.log('=' .repeat(50));
  
  const mongoUtils = new MongoDBUtils();
  
  try {
    // Test connection
    console.log('🔌 Testing MongoDB connection...');
    const connectionTest = await mongoUtils.testConnection();
    
    if (!connectionTest) {
      console.log('❌ MongoDB connection failed!');
      console.log('\n📋 Troubleshooting steps:');
      console.log('1. Make sure MongoDB is running locally on port 27017');
      console.log('2. Or update MONGODB_URI in .env file for remote connection');
      console.log('3. Check if ENABLE_MONGODB=true in .env file');
      return;
    }
    
    // Connect for detailed testing
    await mongoUtils.connect();
    
    // Test storing a sample validation result
    console.log('\n💾 Testing validation result storage...');
    const sampleValidation = {
      timestamp: new Date().toISOString(),
      url: 'https://test.example.com',
      chatFound: true,
      agentforceValidation: {
        agentforceFound: true,
        chatResponsive: true,
        validationScore: 100,
        details: ['Test validation']
      },
      chatInteractionWorking: true,
      overallStatus: 'PASS',
      testData: true
    };
    
    const validationId = await mongoUtils.storeValidationResult(sampleValidation);
    if (validationId) {
      console.log(`✅ Sample validation stored with ID: ${validationId}`);
    }
    
    // Test storing a sample chat interaction
    console.log('\n💬 Testing chat interaction storage...');
    const sampleInteraction = {
      question: 'Test question',
      responseFound: true,
      detectedKeyword: 'test',
      responseTime: 1000,
      url: 'https://test.example.com',
      testData: true
    };
    
    const interactionId = await mongoUtils.storeChatInteraction(sampleInteraction);
    if (interactionId) {
      console.log(`✅ Sample chat interaction stored with ID: ${interactionId}`);
    }
    
    // Test getting validation statistics
    console.log('\n📊 Testing validation statistics...');
    const stats = await mongoUtils.getValidationStats();
    if (stats) {
      console.log('✅ Validation statistics retrieved:');
      console.log(`   Total Validations: ${stats.totalValidations}`);
      console.log(`   Passed Validations: ${stats.passedValidations}`);
      console.log(`   Average Score: ${stats.averageScore?.toFixed(1) || 0}`);
      console.log(`   Last Validation: ${stats.lastValidation || 'None'}`);
    }
    
    // Test getting recent validations
    console.log('\n📋 Testing recent validations retrieval...');
    const recentValidations = await mongoUtils.getRecentValidations(3);
    console.log(`✅ Retrieved ${recentValidations.length} recent validation(s)`);
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    if (mongoUtils.collection) {
      await mongoUtils.collection.deleteMany({ testData: true });
      const chatCollection = mongoUtils.db.collection('chat_interactions');
      await chatCollection.deleteMany({ testData: true });
      console.log('✅ Test data cleaned up');
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 MongoDB Test Completed Successfully!');
    console.log('✅ Your MongoDB setup is ready for Agentforce validation');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ MongoDB test failed:', error.message);
    console.log('\n📋 Common issues and solutions:');
    console.log('1. MongoDB not running: Start MongoDB service');
    console.log('2. Connection string wrong: Check MONGODB_URI in .env');
    console.log('3. Network issues: Check firewall/network settings');
    console.log('4. Authentication: Verify username/password if using Atlas');
  } finally {
    await mongoUtils.disconnect();
  }
}

// Configuration check
function checkConfiguration() {
  console.log('⚙️  Configuration Check:');
  console.log(`   MONGODB_URI: ${process.env.MONGODB_URI || 'Not set (using default)'}`);
  console.log(`   MONGODB_DATABASE: ${process.env.MONGODB_DATABASE || 'Not set (using default)'}`);
  console.log(`   MONGODB_COLLECTION: ${process.env.MONGODB_COLLECTION || 'Not set (using default)'}`);
  console.log(`   ENABLE_MONGODB: ${process.env.ENABLE_MONGODB || 'Not set (using default)'}`);
  console.log('');
}

if (require.main === module) {
  checkConfiguration();
  testMongoDB().catch(console.error);
}

module.exports = { testMongoDB };