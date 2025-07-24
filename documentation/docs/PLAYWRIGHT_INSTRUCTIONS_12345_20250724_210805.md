# Playwright MCP Installation Instructions

## Generated for Test Case: 12345

### 1. Install Dependencies
```bash
npm init -y
npm install @playwright/test playwright
npx playwright install
```

### 2. Run Tests

#### Playwright Test Framework:
```bash
npx playwright test playwright_test_12345_20250724_210805.spec.js
```

#### Codegen Style Script:
```bash
node playwright_codegen_12345_20250724_210805.js
```

#### Multi-Context Playwright (MCP):
```bash
node playwright_mcp_12345_20250724_210805.js
```

#### Page Object Model:
```bash
npx playwright test playwright_pom_12345_20250724_210805.spec.js
```

### 3. Debug Mode
```bash
npx playwright test --debug
```

### 4. Generate Reports
```bash
npx playwright show-report
```

### 5. Cross-Browser Testing
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```
