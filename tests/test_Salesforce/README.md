# Standalone Agentforce Validator with MongoDB Integration

A standalone script to validate Salesforce Agentforce chat functionality with MongoDB database integration for storing validation results and chat interactions.

## 🚀 Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. **Clone or download this folder**
2. **Install all dependencies and browsers:**
   ```bash
   npm run setup
   ```
   
   Or manually:
   ```bash
   npm install
   npm run install-browsers
   ```

3. **Configure MongoDB (Optional but Recommended):**
   - Edit `.env` file to configure your MongoDB connection
   - For local MongoDB: Keep default settings
   - For MongoDB Atlas: Update `MONGODB_URI` with your connection string

4. **Test MongoDB Connection:**
   ```bash
   npm run test-mongodb
   ```

### Usage

#### Option 1: Run as standalone Node.js script
```bash
npm run validate
# or
node standalone_agentforce_validator.js
```

#### Option 2: Run with Playwright test runner (with browser UI)
```bash
npm test
# or
npx playwright test standalone_agentforce_validator.js --headed
```

#### Option 3: Run headless (no browser UI)
```bash
npm run test:headless
# or
npx playwright test standalone_agentforce_validator.js
```

## 🗄️ MongoDB Integration

### Features
- **Validation Results Storage** - All test results stored in MongoDB
- **Chat Interaction Tracking** - Individual chat interactions logged
- **Historical Analytics** - Track validation trends over time
- **Team Collaboration** - Shared database for team insights

### Configuration

Edit `.env` file to configure MongoDB:

```env
# Local MongoDB (default)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=agentforce_validation
MONGODB_COLLECTION=validation_results
ENABLE_MONGODB=true

# MongoDB Atlas (cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
# MONGODB_DATABASE=agentforce_validation
# MONGODB_COLLECTION=validation_results
# ENABLE_MONGODB=true
```

### MongoDB Commands

```bash
# Test MongoDB connection
npm run test-mongodb

# Run validation with MongoDB storage
npm run validate

# Disable MongoDB (set ENABLE_MONGODB=false in .env)
# Script will still work without MongoDB
```

### Database Schema

**Validation Results Collection:**
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "url": "https://www.salesforce.com",
  "chatFound": true,
  "agentforceValidation": {
    "agentforceFound": true,
    "chatResponsive": true,
    "validationScore": 100,
    "details": ["✅ Found keyword: 'agentforce'"]
  },
  "chatInteractionWorking": true,
  "overallStatus": "PASS",
  "mongoDbStored": true,
  "mongoId": "507f1f77bcf86cd799439011",
  "sessionId": "session_1234567890_abc123",
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

**Chat Interactions Collection:**
```json
{
  "question": "What is Salesforce?",
  "responseFound": true,
  "detectedKeyword": "salesforce",
  "responseTime": 2500,
  "url": "https://www.salesforce.com",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "sessionId": "session_1234567890_abc123"
}
```

## 📊 What It Validates

✅ **Chat Interface Detection** - Finds and clicks Salesforce chat button  
✅ **Agentforce Presence** - Detects Agentforce keywords on the page  
✅ **Chat Responsiveness** - Tests if the chat agent responds to questions  
✅ **Response Quality** - Validates response contains relevant keywords  

## 📈 Scoring System

- **100/100**: Perfect - Agentforce detected + Chat fully responsive
- **50/100**: Partial - Agentforce detected but chat issues
- **0/100**: Failed - No Agentforce detected

## 📄 Output

The script generates:
- **Console output** with real-time validation progress
- **JSON report** (`agentforce_validation_report.json`) with detailed results
- **Playwright HTML report** (when using test runner)

## 🔧 Configuration

You can modify the configuration in `standalone_agentforce_validator.js`:

```javascript
const CONFIG = {
  timeout: 60000, // Total test timeout
  pageLoadTimeout: 30000, // Page load timeout
  chatWaitTimeout: 5000, // Wait for chat to appear
  responseWaitTimeout: 8000, // Wait for chat response
  url: 'https://www.salesforce.com' // Target URL
};
```

## 🎯 Example Output

```
🚀 Starting Standalone Agentforce Validation...
==================================================
📍 Navigating to https://www.salesforce.com...
🔍 Looking for chat interface...
✅ Found chat element: button:has-text("Help")
🤖 Performing Agentforce validation...
🎯 Agentforce Validation Score: 100/100
   ✅ Found keyword: "agentforce"
   ✅ Page has substantial content - chat likely responsive
💬 Testing chat interaction...
✅ Response detected with keyword: "salesforce"

==================================================
📊 VALIDATION SUMMARY
==================================================
🌐 URL: https://www.salesforce.com
💬 Chat Found: ✅ Yes
🤖 Agentforce Score: 100/100
🔍 Agentforce Detected: ✅ Yes
💬 Chat Interaction: ✅ Working
📊 Overall Status: PASS
📄 Report saved: agentforce_validation_report.json
==================================================
```

## 🛠 Troubleshooting

**Chat not found?**
- The script tries multiple selectors automatically
- Check if Salesforce has updated their chat interface

**Validation fails?**
- Ensure stable internet connection
- Try running with `--headed` to see what's happening
- Check the generated JSON report for detailed error info

**Browser issues?**
- Run `npm run install-browsers` to reinstall Playwright browsers
- Ensure you have sufficient disk space

## 📁 Files Included

- `standalone_agentforce_validator.js` - Main validation script
- `package.json` - Dependencies and scripts
- `README.md` - This documentation

## 🤝 Team Usage

This script is designed to be:
- **Self-contained** - No external dependencies beyond Playwright
- **Cross-platform** - Works on Windows, Mac, and Linux
- **CI/CD ready** - Can be integrated into automated pipelines
- **Configurable** - Easy to modify for different environments

Share this entire folder with your team - they just need to run `npm install` and they're ready to go!