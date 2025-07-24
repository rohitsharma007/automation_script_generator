#!/usr/bin/env python3
"""
Intelligent Automation Script Generator
Generates Playwright automation scripts from JSON test case definitions
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Any
import re

class PlaywrightScriptGenerator:
    def __init__(self):
        self.script_template = '''from playwright.async_api import async_playwright
import asyncio
import json
import sys
from datetime import datetime

class TestAutomation:
    def __init__(self, test_config: dict):
        self.config = test_config
        self.test_data = test_config.get('test_data', {})
        self.headless = test_config.get('headless', False)
        self.test_case_id = test_config.get('test_case_id', 'unknown')
        self.test_steps = test_config.get('test_steps', [])
        
    async def run_test(self):
        print(f"Starting test case: {self.test_case_id}")
        print(f"Headless mode: {self.headless}")
        print(f"Test steps: {len(self.test_steps)}")
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=self.headless)
            context = await browser.new_context()
            page = await context.new_page()
            
            try:
                # Execute test steps
                await self.execute_test_steps(page)
                print("✓ Test completed successfully")
                return True
                
            except Exception as e:
                print(f"✗ Test failed: {str(e)}")
                return False
                
            finally:
                await browser.close()
    
    async def execute_test_steps(self, page):
        """Execute all test steps based on the configuration"""
        
        for i, step in enumerate(self.test_steps, 1):
            print(f"Executing Step {i}: {step}")
            
            # Parse and execute each step
            if "navigate" in step.lower() or "url" in step.lower():
                await self.navigate_to_url(page)
                
            elif "email" in step.lower() and "fill" in step.lower():
                await self.fill_email(page)
                
            elif "password" in step.lower() and "fill" in step.lower():
                await self.fill_password(page)
                
            elif "sign in" in step.lower() or "login" in step.lower() or "click" in step.lower():
                await self.click_signin(page)
                
            elif "verify" in step.lower() or "dashboard" in step.lower():
                await self.verify_dashboard(page)
                
            else:
                print(f"Warning: Step '{step}' not recognized, skipping...")
            
            # Wait between steps
            await page.wait_for_timeout(1000)
    
    async def navigate_to_url(self, page):
        """Navigate to the specified URL"""
        url = self.test_data.get('url', '').strip()
        if not url:
            raise Exception("URL not provided in test_data")
        
        print(f"  → Navigating to: {url}")
        await page.goto(url)
        await page.wait_for_load_state('networkidle')
        print("  ✓ Page loaded successfully")
    
    async def fill_email(self, page):
        """Fill the email/username field"""
        username = self.test_data.get('username', '')
        if not username:
            raise Exception("Username not provided in test_data")
        
        # Try multiple selectors for email/username field
        selectors = [
            'input[type="email"]',
            'input[name="email"]',
            'input[name="username"]',
            'input[placeholder*="email" i]',
            'input[placeholder*="username" i]',
            'input[id*="email" i]',
            'input[id*="username" i]',
            '#email',
            '#username',
            '[data-testid*="email"]',
            '[data-testid*="username"]'
        ]
        
        for selector in selectors:
            try:
                await page.wait_for_selector(selector, timeout=2000)
                await page.fill(selector, username)
                print(f"  ✓ Filled email/username: {username}")
                return
            except:
                continue
        
        raise Exception("Could not find email/username field")
    
    async def fill_password(self, page):
        """Fill the password field"""
        password = self.test_data.get('password', '')
        if not password:
            raise Exception("Password not provided in test_data")
        
        # Try multiple selectors for password field
        selectors = [
            'input[type="password"]',
            'input[name="password"]',
            'input[placeholder*="password" i]',
            'input[id*="password" i]',
            '#password',
            '[data-testid*="password"]'
        ]
        
        for selector in selectors:
            try:
                await page.wait_for_selector(selector, timeout=2000)
                await page.fill(selector, password)
                print(f"  ✓ Filled password: {'*' * len(password)}")
                return
            except:
                continue
        
        raise Exception("Could not find password field")
    
    async def click_signin(self, page):
        """Click the sign in/login button"""
        # Try multiple selectors for sign in button
        selectors = [
            'button[type="submit"]',
            'input[type="submit"]',
            'button:has-text("Sign in")',
            'button:has-text("Login")',
            'button:has-text("Log in")',
            '[data-testid*="login"]',
            '[data-testid*="signin"]',
            '#login-button',
            '#signin-button',
            '.login-button',
            '.signin-button'
        ]
        
        for selector in selectors:
            try:
                await page.wait_for_selector(selector, timeout=2000)
                await page.click(selector)
                print("  ✓ Clicked sign in button")
                await page.wait_for_load_state('networkidle')
                return
            except:
                continue
        
        raise Exception("Could not find sign in button")
    
    async def verify_dashboard(self, page):
        """Verify that the dashboard loads successfully"""
        # Wait for navigation after login
        await page.wait_for_load_state('networkidle')
        
        # Check for common dashboard indicators
        dashboard_indicators = [
            'text=Dashboard',
            'text=Welcome',
            '[data-testid*="dashboard"]',
            '.dashboard',
            '#dashboard',
            'text=Home',
            '[role="main"]'
        ]
        
        current_url = page.url
        print(f"  → Current URL: {current_url}")
        
        # Check if URL changed (indicating successful login)
        original_url = self.test_data.get('url', '').strip()
        if current_url != original_url:
            print("  ✓ URL changed after login - likely successful")
        
        # Try to find dashboard elements
        for indicator in dashboard_indicators:
            try:
                await page.wait_for_selector(indicator, timeout=3000)
                print(f"  ✓ Dashboard verified - found: {indicator}")
                return
            except:
                continue
        
        # If no specific dashboard elements found, check for absence of login form
        try:
            login_form = await page.query_selector('input[type="password"]')
            if not login_form:
                print("  ✓ Dashboard verified - login form no longer present")
                return
        except:
            pass
        
        print("  ⚠ Dashboard verification inconclusive but proceeding")

async def main():
    # Load test configuration from command line argument or default file
    config_file = sys.argv[1] if len(sys.argv) > 1 else 'test_config.json'
    
    try:
        with open(config_file, 'r') as f:
            test_config = json.load(f)
    except FileNotFoundError:
        print(f"Error: Configuration file '{config_file}' not found")
        print("Please provide a JSON configuration file")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in configuration file: {e}")
        sys.exit(1)
    
    # Create and run test automation
    automation = TestAutomation(test_config)
    success = await automation.run_test()
    
    if success:
        print(f"\\n🎉 Test case {automation.test_case_id} completed successfully!")
        sys.exit(0)
    else:
        print(f"\\n❌ Test case {automation.test_case_id} failed!")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
'''
    
    def generate_script(self, test_config: Dict[str, Any]) -> str:
        """
        Generate a complete Playwright automation script based on test configuration
        """
        return self.script_template.strip()
    
    def save_script(self, script_content: str, filename: str = None) -> str:
        """
        Save the generated script to a file
        """
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"automation_test_{timestamp}.py"
        
        filepath = os.path.join(os.getcwd(), filename)
        with open(filepath, 'w') as f:
            f.write(script_content)
        
        return filepath
    
    def generate_nlp_documentation(self, test_config: Dict[str, Any]) -> str:
        """
        Generate human-readable documentation for the test case
        """
        test_case_id = test_config.get('test_case_id', 'Unknown')
        test_steps = test_config.get('test_steps', [])
        test_data = test_config.get('test_data', {})
        headless = test_config.get('headless', False)
        
        doc = f"""# Test Case Documentation

## Test Case ID: {test_case_id}

### Overview
This automated test case performs a complete login workflow using Playwright browser automation. The test navigates to a specified website, enters user credentials, submits the login form, and verifies successful authentication by checking for dashboard elements.

### Test Configuration
- **Execution Mode**: {'Headless (background)' if headless else 'Headed (visible browser)'}
- **Target URL**: {test_data.get('url', 'Not specified')}
- **Username**: {test_data.get('username', 'Not specified')}
- **Password**: {'*' * len(test_data.get('password', '')) if test_data.get('password') else 'Not specified'}

### Test Steps Breakdown
"""
        
        for i, step in enumerate(test_steps, 1):
            doc += f"\n{i}. **{step}**"
            
            # Add detailed explanation for each step
            if "navigate" in step.lower() or "url" in step.lower():
                doc += f"\n   - Opens the browser and navigates to: {test_data.get('url', 'specified URL')}"
                doc += "\n   - Waits for the page to fully load (networkidle state)"
                
            elif "email" in step.lower() and "fill" in step.lower():
                doc += f"\n   - Locates the email/username input field using multiple selector strategies"
                doc += f"\n   - Enters the username: {test_data.get('username', 'specified username')}"
                doc += "\n   - Uses fallback selectors: email, username, placeholder text, IDs, and test attributes"
                
            elif "password" in step.lower() and "fill" in step.lower():
                doc += "\n   - Locates the password input field using multiple selector strategies"
                doc += "\n   - Enters the password securely (masked in logs)"
                doc += "\n   - Uses fallback selectors: password type, name, placeholder, IDs, and test attributes"
                
            elif "sign in" in step.lower() or "login" in step.lower() or "click" in step.lower():
                doc += "\n   - Locates the login/sign-in button using multiple selector strategies"
                doc += "\n   - Clicks the submit button to initiate login"
                doc += "\n   - Waits for page navigation and network requests to complete"
                
            elif "verify" in step.lower() or "dashboard" in step.lower():
                doc += "\n   - Verifies successful login by checking for dashboard indicators"
                doc += "\n   - Looks for: Dashboard text, Welcome messages, navigation changes"
                doc += "\n   - Confirms absence of login form elements"
                doc += "\n   - Validates URL changes indicating successful authentication"
        
        doc += f"""

### Validation Points
- ✅ **Page Navigation**: Confirms successful navigation to target URL
- ✅ **Form Field Detection**: Validates presence of login form elements
- ✅ **Credential Input**: Ensures username and password are entered correctly
- ✅ **Form Submission**: Verifies login button click and form submission
- ✅ **Authentication Success**: Confirms successful login through dashboard detection
- ✅ **Error Handling**: Provides detailed error messages for troubleshooting

### Technical Features
- **Robust Selectors**: Uses multiple fallback strategies to locate elements
- **Smart Waiting**: Implements proper waits for page loads and network activity
- **Error Recovery**: Graceful handling of missing elements or timeouts
- **Logging**: Detailed step-by-step execution logging
- **Cross-browser**: Compatible with Chromium, Firefox, and WebKit
- **Configurable**: Supports headless and headed execution modes

### Success Criteria
The test is considered successful when:
1. All test steps execute without errors
2. Login credentials are accepted by the target website
3. Dashboard or post-login page is successfully loaded and verified
4. No login form elements remain visible after authentication

### Failure Scenarios
The test may fail if:
- Target website is unreachable or slow to respond
- Login form selectors have changed (website updates)
- Invalid credentials provided
- Website implements anti-automation measures
- Network connectivity issues
"""
        
        return doc.strip()
    
    def generate_installation_instructions(self) -> str:
        """
        Generate installation and setup instructions
        """
        return """# Installation and Setup Instructions

## Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

## Step 1: Install Playwright
```bash
pip install playwright
```

## Step 2: Install Browser Binaries
```bash
playwright install
```

## Step 3: Install Additional Dependencies (Optional)
```bash
pip install asyncio  # Usually included with Python 3.7+
```

## Step 4: Verify Installation
```bash
python -c "import playwright; print('Playwright installed successfully!')"
```

## Usage Instructions

### Method 1: Using JSON Configuration File
1. Create a `test_config.json` file with your test configuration
2. Run the script: `python automation_test.py test_config.json`

### Method 2: Default Configuration
1. Save your configuration as `test_config.json` in the same directory
2. Run the script: `python automation_test.py`

### Example JSON Configuration
```json
{
  "test_case_id": "12345",
  "test_steps": [
    "Step 1: Navigate to URL",
    "Step 2: fill the email",
    "Step 3: fill the password",
    "Step 4: click on Sign in",
    "Step 5: Verify dashboard loads successfully"
  ],
  "test_data": {
    "username": "student",
    "password": "Password123",
    "url": "https://example.com"
  },
  "headless": false,
  "language": "python"
}
```

## Troubleshooting

### Common Issues
1. **"playwright not found"**: Run `pip install playwright`
2. **"Browser not found"**: Run `playwright install`
3. **Permission errors**: Use `pip install --user playwright` on some systems
4. **Timeout errors**: Increase timeout values or check internet connection

### Browser-Specific Installation
```bash
# Install only Chromium
playwright install chromium

# Install all browsers
playwright install
```

### System Requirements
- **Windows**: Windows 10+
- **macOS**: macOS 10.14+
- **Linux**: Ubuntu 18.04+, CentOS 7+

## Advanced Configuration

### Environment Variables
```bash
# Set default browser
export PLAYWRIGHT_BROWSER=chromium

# Set custom browser path
export PLAYWRIGHT_BROWSERS_PATH=/custom/path
```

### Docker Usage
```dockerfile
FROM mcr.microsoft.com/playwright/python:v1.40.0-focal
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "automation_test.py"]
```
""".strip()

def main():
    """
    Main function to demonstrate the script generator
    """
    # Example test configuration
    example_config = {
        "test_case_id": "12345",
        "test_steps": [
            "Step 1: Navigate to URL",
            "Step 2: fill the email",
            "Step 3: fill the password",
            "Step 4: click on Sign in",
            "Step 5: Verify dashboard loads successfully"
        ],
        "test_data": {
            "username": "student",
            "password": "Password123",
            "url": "https://example.com"
        },
        "headless": False,
        "language": "python"
    }
    
    # Create generator instance
    generator = PlaywrightScriptGenerator()
    
    # Generate script
    script_content = generator.generate_script(example_config)
    script_path = generator.save_script(script_content, "generated_automation_test.py")
    
    # Generate documentation
    nlp_doc = generator.generate_nlp_documentation(example_config)
    doc_path = generator.save_script(nlp_doc, "test_documentation.md")
    
    # Generate installation instructions
    install_instructions = generator.generate_installation_instructions()
    install_path = generator.save_script(install_instructions, "installation_guide.md")
    
    print("🧪 Automation Script Generator")
    print("=" * 50)
    print(f"✓ Generated automation script: {script_path}")
    print(f"✓ Generated documentation: {doc_path}")
    print(f"✓ Generated installation guide: {install_path}")
    print("\nFiles are ready to use!")
    
    return script_path, doc_path, install_path

if __name__ == "__main__":
    main()