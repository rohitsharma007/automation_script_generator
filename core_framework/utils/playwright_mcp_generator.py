#!/usr/bin/env python3
"""
Playwright MCP (Multi-Context Playwright) Script Generator
Generates actual Playwright automation scripts from JSON test cases
Integrates with AI-powered element detection for robust script generation
"""

import json
import asyncio
import re
import os
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path

# Import our smart automation model for element detection
from smart_automation_model import SmartElementDetector, SmartPageObjectGenerator, SmartAutomationModel

try:
    from playwright.async_api import async_playwright, Page, Browser, BrowserContext
except ImportError:
    print("Please install playwright: pip install playwright")
    exit(1)

@dataclass
class PlaywrightMCPConfig:
    """Configuration for Playwright MCP script generation"""
    test_case_id: str
    browser_type: str = "chromium"  # chromium, firefox, webkit
    headless: bool = False
    viewport: Dict[str, int] = None
    timeout: int = 30000
    slow_mo: int = 0
    video_recording: bool = False
    screenshot_on_failure: bool = True
    trace_recording: bool = False
    
class PlaywrightMCPGenerator:
    """Generate Playwright MCP scripts with AI-powered element detection"""
    
    def __init__(self):
        self.smart_model = SmartAutomationModel()
        self.detected_elements = {}
        self.page_objects = {}
        
    async def generate_playwright_script(self, test_config: Dict[str, Any]) -> Dict[str, str]:
        """Generate complete Playwright MCP automation script"""
        print("🎭 Generating Playwright MCP Script with AI Element Detection")
        
        # First, run smart detection to get element information
        smart_results = await self.smart_model.process_test_case(test_config)
        self.page_objects = smart_results.get('page_objects', {})
        
        # Generate different script variations
        scripts = {
            'playwright_test': self._generate_playwright_test_script(test_config),
            'playwright_codegen': self._generate_codegen_style_script(test_config),
            'playwright_mcp': self._generate_mcp_script(test_config),
            'page_object_model': self._generate_page_object_script(test_config)
        }
        
        # Save all generated scripts
        await self._save_playwright_scripts(test_config, scripts)
        
        return scripts
    
    def _generate_playwright_test_script(self, test_config: Dict[str, Any]) -> str:
        """Generate Playwright Test framework script"""
        test_id = test_config.get('test_case_id', 'unknown')
        test_data = test_config.get('test_data', {})
        test_steps = test_config.get('test_steps', [])
        
        script = f'''// Generated Playwright Test Script
// Test Case ID: {test_id}
// Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

import {{ test, expect }} from '@playwright/test';

test.describe('Automated Login Test - {test_id}', () => {{
  test('should login successfully', async ({{ page }}) => {{
    // Configure test settings
    test.setTimeout(60000);
    
    // AI-detected elements with confidence scores
'''
        
        # Add detected elements as comments
        for page_name, page_data in self.page_objects.items():
            script += f"    // Page: {page_name}\n"
            for element_name, element_info in page_data.get('elements', {}).items():
                confidence = element_info.get('confidence', 0)
                selector = element_info.get('selector', '')
                script += f"    // {element_name}: '{selector}' (confidence: {confidence:.2f})\n"
        
        script += "\n"
        
        # Generate test steps
        for i, step in enumerate(test_steps, 1):
            script += f"    // {step}\n"
            
            if "navigate" in step.lower():
                script += f"    await page.goto('{test_data.get('url')}');\n"
                script += "    await page.waitForLoadState('networkidle');\n"
                
            elif "email" in step.lower() and "fill" in step.lower():
                email_selector = self._get_best_selector('email')
                script += f"    await page.fill('{email_selector}', '{test_data.get('username')}');\n"
                
            elif "password" in step.lower() and "fill" in step.lower():
                password_selector = self._get_best_selector('password')
                script += f"    await page.fill('{password_selector}', '{test_data.get('password')}');\n"
                
            elif "sign in" in step.lower() or "login" in step.lower() or "click" in step.lower():
                submit_selector = self._get_best_selector('submit')
                script += f"    await page.click('{submit_selector}');\n"
                script += "    await page.waitForLoadState('networkidle');\n"
                
            elif "verify" in step.lower() or "dashboard" in step.lower():
                script += "    // Verify successful login\n"
                script += "    await expect(page).toHaveURL(/.*dashboard.*|.*home.*|.*main.*/);\n"
                script += "    await expect(page.locator('body')).toBeVisible();\n"
            
            script += "\n"
        
        script += '''    // Take screenshot for verification
    await page.screenshot({ path: `test-results/login-success-${Date.now()}.png` });
    
    console.log('✅ Login test completed successfully');
  });
  
  test.afterEach(async ({ page }) => {
    // Cleanup after each test
    await page.close();
  });
});
'''
        
        return script
    
    def _generate_codegen_style_script(self, test_config: Dict[str, Any]) -> str:
        """Generate Playwright Codegen style script"""
        test_id = test_config.get('test_case_id', 'unknown')
        test_data = test_config.get('test_data', {})
        test_steps = test_config.get('test_steps', [])
        
        script = f'''// Generated Playwright Codegen Style Script
// Test Case ID: {test_id}
// Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

const {{ chromium }} = require('playwright');

(async () => {{
  // Launch browser
  const browser = await chromium.launch({{
    headless: {str(test_config.get('headless', False)).lower()},
    slowMo: 1000 // Slow down for better visibility
  }});
  
  const context = await browser.newContext({{
    viewport: {{ width: 1280, height: 720 }}
  }});
  
  const page = await context.newPage();
  
  try {{
    console.log('🎭 Starting Playwright automation...');
    
'''
        
        # Generate steps in codegen style
        for i, step in enumerate(test_steps, 1):
            script += f"    // {step}\n"
            
            if "navigate" in step.lower():
                script += f"    console.log('Step {i}: Navigating to {test_data.get('url')}');\n"
                script += f"    await page.goto('{test_data.get('url')}');\n"
                script += "    await page.waitForLoadState('networkidle');\n"
                
            elif "email" in step.lower() and "fill" in step.lower():
                email_selector = self._get_best_selector('email')
                script += f"    console.log('Step {i}: Filling email field');\n"
                script += f"    await page.locator('{email_selector}').click();\n"
                script += f"    await page.locator('{email_selector}').fill('{test_data.get('username')}');\n"
                
            elif "password" in step.lower() and "fill" in step.lower():
                password_selector = self._get_best_selector('password')
                script += f"    console.log('Step {i}: Filling password field');\n"
                script += f"    await page.locator('{password_selector}').click();\n"
                script += f"    await page.locator('{password_selector}').fill('{test_data.get('password')}');\n"
                
            elif "sign in" in step.lower() or "login" in step.lower() or "click" in step.lower():
                submit_selector = self._get_best_selector('submit')
                script += f"    console.log('Step {i}: Clicking login button');\n"
                script += f"    await page.locator('{submit_selector}').click();\n"
                script += "    await page.waitForLoadState('networkidle');\n"
                
            elif "verify" in step.lower() or "dashboard" in step.lower():
                script += f"    console.log('Step {i}: Verifying successful login');\n"
                script += "    await page.waitForURL(/.*dashboard.*|.*home.*|.*main.*/, { timeout: 10000 });\n"
                script += "    await page.screenshot({ path: 'login-verification.png' });\n"
            
            script += "\n"
        
        script += '''    console.log('✅ Automation completed successfully');
    
  } catch (error) {
    console.error('❌ Automation failed:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  } finally {
    await browser.close();
  }
})();
'''
        
        return script
    
    def _generate_mcp_script(self, test_config: Dict[str, Any]) -> str:
        """Generate Multi-Context Playwright (MCP) script"""
        test_id = test_config.get('test_case_id', 'unknown')
        test_data = test_config.get('test_data', {})
        test_steps = test_config.get('test_steps', [])
        
        script = f'''// Generated Playwright MCP (Multi-Context) Script
// Test Case ID: {test_id}
// Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

const {{ chromium, firefox, webkit }} = require('playwright');

class PlaywrightMCPAutomation {{
  constructor(config = {{}}) {{
    this.config = {{
      browsers: ['chromium'], // Can test across multiple browsers
      headless: {str(test_config.get('headless', False)).lower()},
      viewport: {{ width: 1280, height: 720 }},
      timeout: 30000,
      ...config
    }};
    this.contexts = [];
    this.pages = [];
  }}
  
  async setup() {{
    console.log('🎭 Setting up Multi-Context Playwright...');
    
    for (const browserType of this.config.browsers) {{
      const browser = await this.launchBrowser(browserType);
      const context = await browser.newContext({{
        viewport: this.config.viewport,
        recordVideo: {{ dir: 'videos/' }},
        recordHar: {{ path: `har-files/${{browserType}}-{test_id}.har` }}
      }});
      
      const page = await context.newPage();
      
      // Enable tracing for debugging
      await context.tracing.start({{
        screenshots: true,
        snapshots: true,
        sources: true
      }});
      
      this.contexts.push({{ browser, context, page, browserType }});
      this.pages.push(page);
    }}
  }}
  
  async launchBrowser(browserType) {{
    const browsers = {{ chromium, firefox, webkit }};
    return await browsers[browserType].launch({{
      headless: this.config.headless,
      slowMo: 500
    }});
  }}
  
  async runTest() {{
    try {{
      await this.setup();
      
      // Run test on all contexts simultaneously
      const testPromises = this.contexts.map(async (ctx, index) => {{
        const {{ page, browserType }} = ctx;
        console.log(`🚀 Running test on ${{browserType}}...`);
        
        try {{
'''
        
        # Generate test steps for MCP
        for i, step in enumerate(test_steps, 1):
            script += f"          // {step}\n"
            
            if "navigate" in step.lower():
                script += f"          console.log(`${{browserType}}: Step {i} - Navigating to URL`);\n"
                script += f"          await page.goto('{test_data.get('url')}');\n"
                script += "          await page.waitForLoadState('networkidle');\n"
                
            elif "email" in step.lower() and "fill" in step.lower():
                email_selector = self._get_best_selector('email')
                script += f"          console.log(`${{browserType}}: Step {i} - Filling email`);\n"
                script += f"          await page.fill('{email_selector}', '{test_data.get('username')}');\n"
                
            elif "password" in step.lower() and "fill" in step.lower():
                password_selector = self._get_best_selector('password')
                script += f"          console.log(`${{browserType}}: Step {i} - Filling password`);\n"
                script += f"          await page.fill('{password_selector}', '{test_data.get('password')}');\n"
                
            elif "sign in" in step.lower() or "login" in step.lower() or "click" in step.lower():
                submit_selector = self._get_best_selector('submit')
                script += f"          console.log(`${{browserType}}: Step {i} - Clicking login`);\n"
                script += f"          await page.click('{submit_selector}');\n"
                script += "          await page.waitForLoadState('networkidle');\n"
                
            elif "verify" in step.lower() or "dashboard" in step.lower():
                script += f"          console.log(`${{browserType}}: Step {i} - Verifying success`);\n"
                script += "          await page.waitForSelector('body', { timeout: 10000 });\n"
                script += "          await page.screenshot({ path: `screenshots/${browserType}-success.png` });\n"
            
            script += "\n"
        
        script += '''          console.log(`✅ ${browserType}: Test completed successfully`);
          return { browserType, status: 'passed' };
          
        } catch (error) {
          console.error(`❌ ${browserType}: Test failed:`, error);
          await page.screenshot({ path: `screenshots/${browserType}-error.png` });
          return { browserType, status: 'failed', error: error.message };
        }
      });
      
      // Wait for all tests to complete
      const results = await Promise.allSettled(testPromises);
      
      // Generate test report
      this.generateReport(results);
      
    } finally {
      await this.cleanup();
    }
  }
  
  generateReport(results) {
    console.log('\n📊 Multi-Context Test Report:');
    console.log('=' * 40);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { browserType, status } = result.value;
        console.log(`${browserType}: ${status.toUpperCase()}`);
      } else {
        console.log(`Context ${index}: REJECTED - ${result.reason}`);
      }
    });
  }
  
  async cleanup() {
    console.log('🧹 Cleaning up contexts...');
    
    for (const ctx of this.contexts) {
      try {
        await ctx.context.tracing.stop({ path: `traces/${ctx.browserType}-trace.zip` });
        await ctx.context.close();
        await ctx.browser.close();
      } catch (error) {
        console.error(`Error closing ${ctx.browserType}:`, error);
      }
    }
  }
}

// Execute the MCP automation
(async () => {
  const automation = new PlaywrightMCPAutomation({
    browsers: ['chromium'], // Add 'firefox', 'webkit' for cross-browser testing
    headless: ''' + str(test_config.get('headless', False)).lower() + '''
  });
  
  await automation.runTest();
})();
'''
        
        return script
    
    def _generate_page_object_script(self, test_config: Dict[str, Any]) -> str:
        """Generate Playwright script with Page Object Model"""
        test_id = test_config.get('test_case_id', 'unknown')
        test_data = test_config.get('test_data', {})
        
        script = f'''// Generated Playwright Page Object Model Script
// Test Case ID: {test_id}
// Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

const {{ test, expect }} = require('@playwright/test');

// AI-Generated Page Object Classes
'''
        
        # Generate page object classes
        for page_name, page_data in self.page_objects.items():
            script += f'''class {page_name}Page {{
  constructor(page) {{
    this.page = page;
    
    // AI-detected selectors with confidence scores
'''
            
            for element_name, element_info in page_data.get('elements', {}).items():
                confidence = element_info.get('confidence', 0)
                selector = element_info.get('selector', '')
                script += f"    this.{element_name} = '{selector}'; // Confidence: {confidence:.2f}\n"
            
            script += "  }\n\n"
            
            # Generate action methods
            for element_name, element_info in page_data.get('elements', {}).items():
                element_type = element_info.get('type', 'other')
                
                if element_type == 'email':
                    script += f'''  async fill{element_name.title()}(value) {{
    await this.page.fill(this.{element_name}, value);
  }}\n\n'''
                elif element_type == 'password':
                    script += f'''  async fill{element_name.title()}(value) {{
    await this.page.fill(this.{element_name}, value);
  }}\n\n'''
                elif element_type == 'submit':
                    script += f'''  async click{element_name.title()}() {{
    await this.page.click(this.{element_name});
  }}\n\n'''
            
            script += f'''  async navigateTo(url) {{
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }}
}}
\n'''
        
        # Generate test using page objects
        script += f'''// Test implementation using Page Objects
test.describe('Login Test with Page Objects - {test_id}', () => {{
  test('should login using page object model', async ({{ page }}) => {{
'''
        
        # Initialize page objects
        for page_name in self.page_objects.keys():
            script += f"    const {page_name.lower()}Page = new {page_name}Page(page);\n"
        
        script += "\n"
        
        # Generate test steps using page objects
        test_steps = test_config.get('test_steps', [])
        for i, step in enumerate(test_steps, 1):
            script += f"    // {step}\n"
            
            if "navigate" in step.lower():
                page_name = list(self.page_objects.keys())[0] if self.page_objects else 'login'
                script += f"    await {page_name.lower()}Page.navigateTo('{test_data.get('url')}');\n"
                
            elif "email" in step.lower() and "fill" in step.lower():
                email_element = self._get_element_name_by_type('email')
                if email_element:
                    page_name = list(self.page_objects.keys())[0] if self.page_objects else 'login'
                    script += f"    await {page_name.lower()}Page.fill{email_element.title()}('{test_data.get('username')}');\n"
                
            elif "password" in step.lower() and "fill" in step.lower():
                password_element = self._get_element_name_by_type('password')
                if password_element:
                    page_name = list(self.page_objects.keys())[0] if self.page_objects else 'login'
                    script += f"    await {page_name.lower()}Page.fill{password_element.title()}('{test_data.get('password')}');\n"
                
            elif "sign in" in step.lower() or "login" in step.lower() or "click" in step.lower():
                submit_element = self._get_element_name_by_type('submit')
                if submit_element:
                    page_name = list(self.page_objects.keys())[0] if self.page_objects else 'login'
                    script += f"    await {page_name.lower()}Page.click{submit_element.title()}();\n"
                    script += "    await page.waitForLoadState('networkidle');\n"
                
            elif "verify" in step.lower() or "dashboard" in step.lower():
                script += "    await expect(page).toHaveURL(/.*dashboard.*|.*home.*|.*main.*/);\n"
            
            script += "\n"
        
        script += '''    console.log('✅ Page Object Model test completed');
  });
});
'''
        
        return script
    
    def _get_best_selector(self, element_type: str) -> str:
        """Get the best selector for an element type"""
        for page_data in self.page_objects.values():
            for element_name, element_info in page_data.get('elements', {}).items():
                if element_info.get('type') == element_type:
                    return element_info.get('selector', f'[data-testid="{element_type}"]')
        
        # Fallback selectors
        fallbacks = {
            'email': 'input[type="email"], input[name*="email" i], input[name*="username" i]',
            'password': 'input[type="password"]',
            'submit': 'button[type="submit"], button:has-text("Login"), button:has-text("Sign in")'
        }
        return fallbacks.get(element_type, f'[data-testid="{element_type}"]')
    
    def _get_element_name_by_type(self, element_type: str) -> str:
        """Get element name by type"""
        for page_data in self.page_objects.values():
            for element_name, element_info in page_data.get('elements', {}).items():
                if element_info.get('type') == element_type:
                    return element_name
        return element_type
    
    async def _save_playwright_scripts(self, test_config: Dict[str, Any], scripts: Dict[str, str]):
        """Save all generated Playwright scripts"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        test_id = test_config.get('test_case_id', 'unknown')
        
        saved_files = []
        
        for script_type, script_content in scripts.items():
            if script_type == 'playwright_test':
                filename = f"playwright_test_{test_id}_{timestamp}.spec.js"
            elif script_type == 'playwright_codegen':
                filename = f"playwright_codegen_{test_id}_{timestamp}.js"
            elif script_type == 'playwright_mcp':
                filename = f"playwright_mcp_{test_id}_{timestamp}.js"
            elif script_type == 'page_object_model':
                filename = f"playwright_pom_{test_id}_{timestamp}.spec.js"
            else:
                filename = f"playwright_{script_type}_{test_id}_{timestamp}.js"
            
            with open(filename, 'w') as f:
                f.write(script_content)
            
            saved_files.append(filename)
            print(f"📄 Generated: {filename}")
        
        # Create package.json for the generated scripts
        package_json = {
            "name": f"playwright-automation-{test_id.lower()}",
            "version": "1.0.0",
            "description": f"Generated Playwright automation scripts for test case {test_id}",
            "scripts": {
                "test": "npx playwright test",
                "test:headed": "npx playwright test --headed",
                "test:debug": "npx playwright test --debug",
                "codegen": f"node playwright_codegen_{test_id}_{timestamp}.js",
                "mcp": f"node playwright_mcp_{test_id}_{timestamp}.js"
            },
            "devDependencies": {
                "@playwright/test": "^1.40.0",
                "playwright": "^1.40.0"
            }
        }
        
        with open(f'package_{test_id}_{timestamp}.json', 'w') as f:
            json.dump(package_json, f, indent=2)
        
        # Create playwright.config.js
        config_content = f'''// Playwright Configuration
// Generated for test case: {test_id}

module.exports = {{
  testDir: './',
  timeout: 30000,
  expect: {{
    timeout: 5000
  }},
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {{
    baseURL: '{test_config.get('test_data', {}).get('url', '')}',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }},
  projects: [
    {{
      name: 'chromium',
      use: {{ ...require('@playwright/test').devices['Desktop Chrome'] }}
    }},
    {{
      name: 'firefox',
      use: {{ ...require('@playwright/test').devices['Desktop Firefox'] }}
    }},
    {{
      name: 'webkit',
      use: {{ ...require('@playwright/test').devices['Desktop Safari'] }}
    }}
  ]
}};
'''
        
        with open(f'playwright.config_{test_id}_{timestamp}.js', 'w') as f:
            f.write(config_content)
        
        print(f"\n📦 Generated Playwright Project Files:")
        for file in saved_files:
            print(f"  • {file}")
        print(f"  • package_{test_id}_{timestamp}.json")
        print(f"  • playwright.config_{test_id}_{timestamp}.js")
        
        # Create installation instructions
        instructions = f'''# Playwright MCP Installation Instructions

## Generated for Test Case: {test_id}

### 1. Install Dependencies
```bash
npm init -y
npm install @playwright/test playwright
npx playwright install
```

### 2. Run Tests

#### Playwright Test Framework:
```bash
npx playwright test playwright_test_{test_id}_{timestamp}.spec.js
```

#### Codegen Style Script:
```bash
node playwright_codegen_{test_id}_{timestamp}.js
```

#### Multi-Context Playwright (MCP):
```bash
node playwright_mcp_{test_id}_{timestamp}.js
```

#### Page Object Model:
```bash
npx playwright test playwright_pom_{test_id}_{timestamp}.spec.js
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
'''
        
        with open(f'PLAYWRIGHT_INSTRUCTIONS_{test_id}_{timestamp}.md', 'w') as f:
            f.write(instructions)
        
        print(f"  • PLAYWRIGHT_INSTRUCTIONS_{test_id}_{timestamp}.md")

# Main execution function
async def main():
    """Generate Playwright MCP scripts from JSON test case"""
    
    # Load test configuration
    try:
        with open('sample.json', 'r') as f:
            test_config = json.load(f)
    except FileNotFoundError:
        print("❌ sample.json not found. Creating default configuration...")
        test_config = {
            "test_case_id": "PLAYWRIGHT_MCP_001",
            "test_steps": [
                "Step 1: Navigate to URL",
                "Step 2: fill the email",
                "Step 3: fill the password",
                "Step 4: click on Sign in",
                "Step 5: Verify dashboard loads successfully"
            ],
            "test_data": {
                "username": "Admin",
                "password": "admin123",
                "url": "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login"
            },
            "headless": False,
            "language": "javascript"
        }
    
    print("🎭 Playwright MCP Generator with AI Element Detection")
    print("=" * 60)
    
    # Generate Playwright scripts
    generator = PlaywrightMCPGenerator()
    scripts = await generator.generate_playwright_script(test_config)
    
    print("\n✅ Playwright MCP script generation completed!")
    print("\n📋 Generated Script Types:")
    for script_type in scripts.keys():
        print(f"  • {script_type.replace('_', ' ').title()}")
    
    print("\n🚀 Next Steps:")
    print("1. Install Node.js and npm")
    print("2. Run: npm install @playwright/test playwright")
    print("3. Run: npx playwright install")
    print("4. Execute any of the generated scripts")
    
    return scripts

if __name__ == "__main__":
    asyncio.run(main())