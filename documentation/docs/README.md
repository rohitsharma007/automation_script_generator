# Playwright MCP Automation System

🎭 **AI-Powered Multi-Context Playwright Script Generator**

A comprehensive automation system that generates production-ready Playwright scripts with AI-powered element detection and multi-context testing capabilities.

## 🚀 Features

- **Multi-Context Playwright (MCP)**: Run tests across multiple browser contexts simultaneously
- **AI Element Detection**: Smart selector generation with confidence scoring
- **Cross-Browser Testing**: Support for Chromium, Firefox, and WebKit
- **Multiple Script Formats**: Test framework, codegen style, MCP, and Page Object Model
- **Production-Ready**: Video recording, screenshots, HAR files, and tracing
- **Dynamic Script Generation**: From JSON test case configurations

## 📁 Project Structure

```
├── playwright_mcp_generator.py          # Main MCP generator
├── smart_automation_model.py            # AI element detection engine
├── setup_smart_automation.py            # Setup and installation script
├── sample.json                          # Test configuration example
├── requirements_smart.txt               # Python dependencies
├── SMART_AUTOMATION_GUIDE.md           # Detailed documentation
└── Generated Files/
    ├── playwright_test_*.spec.js        # Playwright Test framework scripts
    ├── playwright_codegen_*.js          # Codegen style scripts
    ├── playwright_mcp_*.js              # Multi-Context Playwright scripts
    ├── playwright_pom_*.spec.js         # Page Object Model scripts
    ├── package_*.json                   # NPM configuration
    ├── playwright.config_*.js           # Playwright configuration
    └── PLAYWRIGHT_INSTRUCTIONS_*.md     # Usage instructions
```

## 🛠️ Quick Start

### 1. Install Python Dependencies
```bash
pip install -r requirements_smart.txt
python setup_smart_automation.py
```

### 2. Generate Playwright Scripts
```bash
python playwright_mcp_generator.py
```

### 3. Install Node.js Dependencies
```bash
npm install @playwright/test playwright
npx playwright install
```

### 4. Run Generated Scripts

#### Multi-Context Playwright (MCP)
```bash
node playwright_mcp_*.js
```

#### Playwright Test Framework
```bash
npx playwright test playwright_test_*.spec.js
```

#### Page Object Model
```bash
npx playwright test playwright_pom_*.spec.js
```

## 📋 Test Configuration Format

Create a JSON file with your test case:

```json
{
  "test_case_id": "LOGIN_001",
  "test_steps": [
    "Step 1: Navigate to URL",
    "Step 2: fill the email",
    "Step 3: fill the password",
    "Step 4: click on Sign in",
    "Step 5: Verify dashboard loads successfully"
  ],
  "test_data": {
    "username": "your_username",
    "password": "your_password",
    "url": "https://your-app.com/login"
  },
  "headless": false,
  "language": "javascript"
}
```

## 🎯 Generated Script Types

### 1. Playwright Test Framework
- Uses `@playwright/test` with modern async/await syntax
- Built-in assertions and test structure
- Automatic screenshot on failure

### 2. Playwright Codegen Style
- Direct Playwright API usage
- Step-by-step console logging
- Similar to `npx playwright codegen` output

### 3. Multi-Context Playwright (MCP)
- **Core feature**: Run tests across multiple browser contexts
- Cross-browser testing capabilities
- Advanced recording and tracing
- Parallel execution with result aggregation

### 4. Page Object Model
- AI-generated page classes
- Reusable and maintainable structure
- Smart element detection integration

## 🧠 AI Element Detection

The system uses intelligent algorithms to:
- Detect form elements (email, password, submit buttons)
- Generate robust CSS selectors
- Provide confidence scores for each element
- Handle dynamic content and complex layouts

## 🔧 Advanced Usage

### Custom Configuration
```python
from playwright_mcp_generator import PlaywrightMCPGenerator

generator = PlaywrightMCPGenerator()
scripts = await generator.generate_playwright_script(your_config)
```

### Cross-Browser Testing
Modify the MCP script to test across multiple browsers:
```javascript
const automation = new PlaywrightMCPAutomation({
  browsers: ['chromium', 'firefox', 'webkit'],
  headless: false
});
```

## 📊 Features Comparison

| Feature | Basic Automation | Smart Model | Playwright MCP |
|---------|------------------|-------------|----------------|
| Element Detection | Manual | AI-Powered | AI-Powered |
| Script Format | Python | Python | JavaScript |
| Cross-Browser | ❌ | ❌ | ✅ |
| Multi-Context | ❌ | ❌ | ✅ |
| Page Objects | ❌ | ✅ | ✅ |
| Production Ready | ❌ | ✅ | ✅ |

## 🚀 Production Deployment

1. **CI/CD Integration**: Use generated scripts in your pipeline
2. **Parallel Execution**: Leverage MCP for faster test runs
3. **Monitoring**: Built-in reporting and screenshot capture
4. **Scalability**: Easy to extend with new test cases

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the generated `PLAYWRIGHT_INSTRUCTIONS_*.md` files
2. Review the `SMART_AUTOMATION_GUIDE.md`
3. Run `python setup_smart_automation.py` for setup verification

---

**Built with ❤️ using Playwright, AI, and modern automation practices**