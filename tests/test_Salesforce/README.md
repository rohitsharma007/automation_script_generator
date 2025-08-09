# Enhanced Agentforce Validator Suite

A comprehensive test automation suite for validating Salesforce Agentforce chat functionality with AI-powered intelligence, MongoDB integration, and advanced testing utilities.

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **MongoDB** (optional but recommended) - [Download here](https://www.mongodb.com/try/download/community)

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <your-repository-url>

# Navigate to the Salesforce test directory
cd nlp/tests/test_Salesforce
```

### Step 2: Install Dependencies

```bash
# Install all Node.js dependencies
npm install

# Install Playwright browsers (required for testing)
npm run install-browsers

# Or run both commands at once
npm run setup
```

### Step 3: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your settings
nano .env  # or use your preferred editor
```

**Required Configuration:**
```env
# AI Configuration (for Enhanced Validator)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=2000

# MongoDB Configuration (Optional)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=agentforce_validation
MONGODB_COLLECTION=test_results
```

**Get your OpenAI API Key:**
1. Visit [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy and paste it into your `.env` file

### Step 4: Test Your Setup

```bash
# Test MongoDB connection (optional)
npm run test-mongodb

# Run a quick validation test
npm run validate
```

### Step 5: Run Your First Validation

```bash
# Run the comprehensive demo (recommended for first-time users)
npm run demo

# Or run individual validators:
npm run validate          # Standard validator
npm run validate-mcp      # MCP enhanced validator
npm run validate-enhanced # AI enhanced validator
```

## 🎯 Available Validators

### 1. Standard Validator (Recommended for CI/CD)
```bash
npm run validate
```
**Features:**
- Basic Agentforce validation
- MongoDB integration
- Fast execution (~30-40 seconds)
- Perfect for automated testing

### 2. MCP Enhanced Validator
```bash
npm run validate-mcp
```
**Features:**
- Multi-context testing
- Learning algorithms
- Performance metrics
- Enhanced tracing and debugging

### 3. AI Enhanced Validator
```bash
npm run validate-enhanced
```
**Features:**
- AI-powered test generation
- Intelligent element detection
- Comprehensive analysis
- Accessibility and security scanning
- **Requires OpenAI API key**

### 4. Demo Mode (Compare All Validators)
```bash
npm run demo
```
**Features:**
- Runs all three validators
- Generates comparison reports
- Provides recommendations
- Perfect for evaluation

## 📁 Project Structure

```
test_Salesforce/
├── README.md                           # This file
├── package.json                        # Dependencies and scripts
├── .env.example                        # Environment template
├── .env                               # Your configuration (create this)
├── demo.js                            # Demo script
├── standalone_agentforce_validator.js  # Standard validator
├── agentforce_validator_mcp.js        # MCP enhanced validator
├── enhanced_agentforce_validator.js   # AI enhanced validator
├── common/utils/                      # Utility modules
├── reports/                           # Generated reports
├── logs/                             # Log files
├── screenshots/                       # Test screenshots
└── traces/                           # Playwright traces
```

## 🔧 Configuration Options

### Environment Variables (.env file)

```env
# AI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=2000

# MongoDB Configuration (Optional)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=agentforce_validation
MONGODB_COLLECTION=test_results

# Validation Settings
VALIDATION_TIMEOUT=30000
MAX_RETRIES=3
HEADLESS_MODE=false

# Reporting Configuration
REPORT_DIRECTORY=./reports
GENERATE_SCREENSHOTS=true
GENERATE_VIDEO=false

# Security Settings
ENABLE_SECURITY_SCAN=true
ENABLE_ACCESSIBILITY_SCAN=true
ENABLE_PERFORMANCE_SCAN=true

# Debug Settings
DEBUG_MODE=false
VERBOSE_LOGGING=false
```

## 🛠️ Troubleshooting

### Common Issues and Solutions

**1. "Command not found: npm"**
```bash
# Install Node.js from https://nodejs.org/
# Verify installation:
node --version
npm --version
```

**2. "Playwright browsers not installed"**
```bash
npm run install-browsers
# Or manually:
npx playwright install
```

**3. "MongoDB connection failed"**
```bash
# Install MongoDB locally or use MongoDB Atlas
# Update MONGODB_URI in .env file
# MongoDB is optional - validators work without it
```

**4. "OpenAI API key invalid"**
```bash
# Get a valid API key from https://platform.openai.com/
# Ensure you have credits in your OpenAI account
# Update OPENAI_API_KEY in .env file
```

**5. "Permission denied"**
```bash
# On macOS/Linux, you might need:
sudo npm install -g playwright
# Or use npx instead of global installation
```

### Getting Help

1. **Check the logs**: Look in the `logs/` directory for detailed error information
2. **Run with debug mode**: Set `DEBUG_MODE=true` in your `.env` file
3. **Test individual components**: Use `npm run test-mongodb` to test specific parts
4. **Check reports**: Review generated reports in the `reports/` directory

## 📊 Understanding Results

### Validation Scores
- **100/100**: Perfect - Agentforce fully functional
- **75-99**: Good - Minor issues detected
- **50-74**: Fair - Some functionality missing
- **25-49**: Poor - Significant issues
- **0-24**: Failed - Major problems detected

### Report Files
- `agentforce_validation_report.json`: Detailed validation results
- `validation_summary.md`: Human-readable summary
- `validator_comparison_demo.json`: Comparison of all validators
- `enhanced_agentforce_validation_report.json`: AI-enhanced analysis

## 🚀 Advanced Usage

### Custom Target URLs

Edit the validator files to test different URLs:

```javascript
// In any validator file, change:
const targetUrl = 'https://your-salesforce-instance.com';
```

### CI/CD Integration

```bash
# Add to your CI/CD pipeline:
npm run setup
npm run validate

# Check exit code for pass/fail
echo $?  # 0 = success, 1 = failure
```

### Scheduled Testing

```bash
# Add to crontab for daily testing:
0 9 * * * cd /path/to/test_Salesforce && npm run validate
```

## 📋 Available Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run setup` | Install dependencies and browsers | Initial setup |
| `npm run validate` | Run standard validator | CI/CD, regular monitoring |
| `npm run validate-mcp` | Run MCP enhanced validator | Debugging, detailed analysis |
| `npm run validate-enhanced` | Run AI enhanced validator | Comprehensive testing |
| `npm run demo` | Run all validators with comparison | Evaluation, reporting |
| `npm run test-mongodb` | Test MongoDB connection | Setup verification |
| `npm run install-browsers` | Install Playwright browsers | Browser setup |

## 🌟 Features Overview

### Standard Validator
- ✅ Basic Agentforce detection
- ✅ Chat interface validation
- ✅ MongoDB integration
- ✅ Fast execution
- ✅ CI/CD friendly

### MCP Enhanced Validator
- ✅ Multi-context testing
- ✅ Learning algorithms
- ✅ Performance metrics
- ✅ Enhanced debugging
- ✅ Video recording

### AI Enhanced Validator
- ✅ AI-powered analysis
- ✅ Intelligent test generation
- ✅ Accessibility testing
- ✅ Security scanning
- ✅ Advanced reporting

## 📝 License

MIT License - feel free to use and modify as needed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Need help?** Check the troubleshooting section above or review the generated reports for detailed information about any issues.