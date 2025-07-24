// Generated Playwright Page Object Model Script
// Test Case ID: 12345
// Generated on: 2025-07-24 21:08:05

const { test, expect } = require('@playwright/test');

// AI-Generated Page Object Classes
class OrangeHRMPage {
  constructor(page) {
    this.page = page;
    
    // AI-detected selectors with confidence scores
    this.password = '[name="password"]'; // Confidence: 0.95
    this.submit_Login = 'button[type="submit"]'; // Confidence: 0.85
    this.app = '#app'; // Confidence: 0.36
    this.username = '[name="username"]'; // Confidence: 0.90
    this.password_3 = '[name="password"]'; // Confidence: 0.95
  }

  async fillPassword(value) {
    await this.page.fill(this.password, value);
  }

  async clickSubmit_Login() {
    await this.page.click(this.submit_Login);
  }

  async fillApp(value) {
    await this.page.fill(this.app, value);
  }

  async fillUsername(value) {
    await this.page.fill(this.username, value);
  }

  async fillPassword_3(value) {
    await this.page.fill(this.password_3, value);
  }

  async navigateTo(url) {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }
}

// Test implementation using Page Objects
test.describe('Login Test with Page Objects - 12345', () => {
  test('should login using page object model', async ({ page }) => {
    const orangehrmPage = new OrangeHRMPage(page);

    // Step 1: Navigate to URL
    await orangehrmPage.navigateTo('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');

    // Step 2: fill the email
    await orangehrmPage.fillApp('Admin');

    // Step 3: fill the password
    await orangehrmPage.fillPassword('admin123');

    // Step 4: click on Sign in
    await orangehrmPage.clickSubmit_Login();
    await page.waitForLoadState('networkidle');

    // Step 5: Verify dashboard loads successfully
    await expect(page).toHaveURL(/.*dashboard.*|.*home.*|.*main.*/);

    console.log('✅ Page Object Model test completed');
  });
});
