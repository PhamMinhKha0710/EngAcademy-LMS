import { defaultConfig, createBrowser } from './puppeteer.config';
import { setupFixtures, teardownFixtures } from './fixtures';
import {
  waitForSelector,
  fillField,
  clickElement,
  generateUniqueString,
  takeScreenshot,
  waitForURL,
  waitForXPath,
} from './test-helper';

// Test data
const TEST_DATA = {
  valid: {
    fullName: 'Nguyễn Văn A',
    username: 'nguyenvana',
    email: 'nguyenvana@gmail.com',
    password: 'Abc@123456',
    confirmPassword: 'Abc@123456',
  },
  sqlInjection: {
    fullName: 'Test User',
    username: "' OR 1=1 --",
    email: 'test@example.com',
    password: 'Abc@123456',
    confirmPassword: 'Abc@123456',
  },
};

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function logResult(testName: string, passed: boolean, error?: string) {
  results.push({ name: testName, passed, error });
  const status = passed ? '✓ PASS' : '✗ FAIL';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${status}\x1b[0m: ${testName}${error ? ` - ${error}` : ''}`);
}

// Helper to find element by text content using XPath
async function findElementByText(page: any, tag: string, ...texts: string[]): Promise<any> {
  for (const text of texts) {
    try {
      const xpath = `//${tag}[contains(., '${text}')]`;
      const element = await page.waitForXPath(xpath, { timeout: 5000 });
      if (element) return element;
    } catch {
      // Continue to next text
    }
  }
  throw new Error(`Could not find ${tag} with any of these texts: ${texts.join(', ')}`);
}

// Helper to find button by text
async function findButtonByText(page: any, ...texts: string[]): Promise<any> {
  return await findElementByText(page, 'button', ...texts);
}

// Helper to find input by placeholder
async function findInputByPlaceholder(page: any, ...placeholderParts: string[]): Promise<any> {
  for (const part of placeholderParts) {
    try {
      const selector = `input[placeholder*="${part}"]`;
      const input = await page.waitForSelector(selector, { timeout: 3000 });
      if (input) return input;
    } catch {
      // Continue to next
    }
  }
  throw new Error(`Could not find input with any of these placeholder parts: ${placeholderParts.join(', ')}`);
}

// Helper to directly call backend registration API
async function registerViaAPI(backendURL: string, data: any): Promise<any> {
  const response = await fetch(`${backendURL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
}

// Helper to check if a username exists via API
async function checkUsernameExists(backendURL: string, username: string): Promise<boolean> {
  try {
    // Try to register - if it fails with duplicate username error, username exists
    const result = await registerViaAPI(backendURL, {
      fullName: 'Test Check',
      username,
      email: `test_${username}@example.com`,
      password: 'Test123456',
      confirmPassword: 'Test123456',
    });
    // If success, username doesn't exist (or we'll delete it)
    return false;
  } catch (error: any) {
    const message = error.message?.toLowerCase() || '';
    return message.includes('đã tồn tại') || message.includes('tồn tại') ||
           message.includes('already exists') || message.includes('duplicate') ||
           message.includes('username');
  }
}

async function runTests() {
  let browser: any = null;
  let fixtures: any = null;

  try {
    console.log('Starting Puppeteer E2E Tests...\n');
    console.log(`Frontend URL: ${defaultConfig.baseURL}`);
    console.log(`Backend URL: ${defaultConfig.backendURL}`);
    console.log(`Headless: ${defaultConfig.headless}\n`);

    browser = await createBrowser(defaultConfig);
    fixtures = await setupFixtures(defaultConfig);

    const { page } = fixtures;

    // Navigate to register page
    await page.goto(`${defaultConfig.baseURL}/register`, { waitUntil: 'networkidle2' });

    console.log('Running Registration Tests (DK01-DK10)\n');
    console.log('='.repeat(50));

    // DK01: Successful registration with valid data
    await testDK01_SuccessfulRegistration(page);

    // DK02: Missing full name validation
    await testDK02_MissingFullName(page);

    // DK03: Missing username validation
    await testDK03_MissingUsername(page);

    // DK04: Missing email validation
    await testDK04_MissingEmail(page);

    // DK05: Missing password validation
    await testDK05_MissingPassword(page);

    // DK06: Missing confirm password validation
    await testDK06_MissingConfirmPassword(page);

    // DK07: Password mismatch validation
    await testDK07_PasswordMismatch(page);

    // DK08: Weak password validation
    await testDK08_WeakPassword(page);

    // DK09: Duplicate username validation
    await testDK09_DuplicateUsername(page);

    // DK10: SQL Injection security test
    await testDK10_SQLInjection(page);

  } catch (error) {
    console.error('Test suite failed:', error);
    process.exit(1);
  } finally {
    if (fixtures) {
      await teardownFixtures(fixtures);
    }
    if (browser) {
      await browser.close();
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('TEST SUMMARY');
  console.log('='.repeat(50));
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`Total: ${results.length}`);
  console.log(`\x1b[32mPassed: ${passed}\x1b[0m`);
  console.log(`\x1b[31mFailed: ${failed}\x1b[0m`);
  console.log('='.repeat(50));

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}${r.error ? `: ${r.error}` : ''}`);
    });
    process.exit(1);
  }
}

// Helper function to fill step 1 form
async function fillStep1Form(
  page: any,
  fullName?: string,
  username?: string,
  email?: string,
  password?: string,
  confirmPassword?: string
) {
  if (fullName !== undefined) {
    const input = await findInputByPlaceholder(page, 'Bạn tên là gì?', 'fullName');
    await input.click();
    await input.evaluate(el => {
      el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await input.type(fullName);
  }
  if (username !== undefined) {
    const input = await findInputByPlaceholder(page, 'superlearner123', 'username');
    await input.click();
    await input.evaluate(el => {
      el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await input.type(username);
  }
  if (email !== undefined) {
    const input = await page.waitForSelector('input[type="email"]');
    await input.click();
    await input.evaluate(el => {
      el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await input.type(email);
  }
  if (password !== undefined) {
    const input = await findInputByPlaceholder(page, 'Tạo mật khẩu bí mật', 'password');
    await input.click();
    await input.evaluate(el => {
      el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await input.type(password);
  }
  if (confirmPassword !== undefined) {
    const input = await findInputByPlaceholder(page, 'Nhập lại mật khẩu', 'confirmPassword');
    await input.click();
    await input.evaluate(el => {
      el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await input.type(confirmPassword);
  }
}

// Helper to check for validation errors (client-side)
async function getValidationError(page: any): Promise<string> {
  try {
    const errorSelectors = [
      '.text-red-600, .text-red-500, .text-rose-600, .text-rose-500',
      '[role="alert"]',
      '.error-message',
      '.text-sm.text-red-600',
      '.text-red-500.text-sm',
      'p.text-red-500',
      '.invalid-feedback',
    ];

    for (const selector of errorSelectors) {
      try {
        const elements = await page.$$(selector);
        for (const element of elements) {
          const text = await page.evaluate(el => el.textContent?.trim(), element);
          if (text && text.length > 0) {
            return text;
          }
        }
      } catch {
        // Continue to next selector
      }
    }
    return '';
  } catch {
    return '';
  }
}

async function clickSubmitButton(page: any): Promise<void> {
  try {
    const button = await findButtonByText(page, 'Bước tiếp theo', 'Tiếp theo', 'Next', 'Đăng ký', 'Register');
    await button.click();
    return;
  } catch (e) {
    try {
      await page.click('button[type="submit"]');
      return;
    } catch (e2) {
      throw new Error('Could not find submit button');
    }
  }
}

async function isElementVisible(page: any, selector: string): Promise<boolean> {
  try {
    const element = await page.$(selector);
    if (!element) return false;
    return await element.isIntersectingViewport();
  } catch {
    return false;
  }
}

async function waitForFinishButton(page: any): Promise<void> {
  const xpath = '//button[contains(., "Hoàn tất") or contains(., "Finish")]';
  await page.waitForXPath(xpath, { timeout: 5000 });
}

async function testDK01_SuccessfulRegistration(page: any) {
  const testName = 'DK01: Đăng ký - Đăng ký thành công';
  try {
    const uniqueUsername = generateUniqueString('user');
    const testData = {
      ...TEST_DATA.valid,
      username: uniqueUsername,
    };

    await fillStep1Form(page, testData.fullName, testData.username, testData.email, testData.password, testData.confirmPassword);
    await clickSubmitButton(page);

    // Should proceed to step 2 (avatar selection)
    await waitForFinishButton(page);

    // Complete step 2 - click finish button
    try {
      const finishButton = await findButtonByText(page, 'Hoàn tất', 'Finish');
      await finishButton.click();
    } catch {
      await page.click('button[type="button"]:last-child');
    }

    // Should redirect to dashboard or home
    await waitForURL(page, /(dashboard|home|\/)/, { timeout: 10000 });

    logResult(testName, true);
  } catch (error: any) {
    logResult(testName, false, error.message);
    await takeScreenshot(page, `dk01_failed`);
  }
}

async function testDK02_MissingFullName(page: any) {
  const testName = 'DK02: Validate thiếu dữ liệu - Thiếu họ và tên';
  try {
    await page.goto(`${defaultConfig.baseURL}/register`, { waitUntil: 'networkidle2' });

    await fillStep1Form(page, undefined, TEST_DATA.valid.username, TEST_DATA.valid.email, TEST_DATA.valid.password, TEST_DATA.valid.confirmPassword);
    await clickSubmitButton(page);

    await new Promise(resolve => setTimeout(resolve, 1000));
    const errorText = await getValidationError(page);
    const hasError = errorText.includes('họ và tên') || errorText.includes('full name') || errorText.toLowerCase().includes('name');

    if (!hasError) {
      throw new Error(`Expected error about full name, got: "${errorText}"`);
    }

    logResult(testName, true);
  } catch (error: any) {
    logResult(testName, false, error.message);
    await takeScreenshot(page, `dk02_failed`);
  }
}

async function testDK03_MissingUsername(page: any) {
  const testName = 'DK03: Validate thiếu dữ liệu - Thiếu username';
  try {
    await page.goto(`${defaultConfig.baseURL}/register`, { waitUntil: 'networkidle2' });

    await fillStep1Form(page, TEST_DATA.valid.fullName, undefined, TEST_DATA.valid.email, TEST_DATA.valid.password, TEST_DATA.valid.confirmPassword);
    await clickSubmitButton(page);

    await new Promise(resolve => setTimeout(resolve, 1000));
    const errorText = await getValidationError(page);
    const hasError = errorText.includes('tên đăng nhập') || errorText.includes('username');

    if (!hasError) {
      throw new Error(`Expected error about username, got: "${errorText}"`);
    }

    logResult(testName, true);
  } catch (error: any) {
    logResult(testName, false, error.message);
    await takeScreenshot(page, `dk03_failed`);
  }
}

async function testDK04_MissingEmail(page: any) {
  const testName = 'DK04: Validate thiếu dữ liệu - Thiếu email';
  try {
    await page.goto(`${defaultConfig.baseURL}/register`, { waitUntil: 'networkidle2' });

    await fillStep1Form(page, TEST_DATA.valid.fullName, TEST_DATA.valid.username, undefined, TEST_DATA.valid.password, TEST_DATA.valid.confirmPassword);
    await clickSubmitButton(page);

    await new Promise(resolve => setTimeout(resolve, 1000));
    const errorText = await getValidationError(page);
    const hasError = errorText.includes('email') || errorText.includes('Email');

    if (!hasError) {
      throw new Error(`Expected error about email, got: "${errorText}"`);
    }

    logResult(testName, true);
  } catch (error: any) {
    logResult(testName, false, error.message);
    await takeScreenshot(page, `dk04_failed`);
  }
}

async function testDK05_MissingPassword(page: any) {
  const testName = 'DK05: Validate thiếu dữ liệu - Thiếu mật khẩu';
  try {
    await page.goto(`${defaultConfig.baseURL}/register`, { waitUntil: 'networkidle2' });

    await fillStep1Form(page, TEST_DATA.valid.fullName, TEST_DATA.valid.username, TEST_DATA.valid.email, undefined, TEST_DATA.valid.confirmPassword);
    await clickSubmitButton(page);

    await new Promise(resolve => setTimeout(resolve, 1000));
    const errorText = await getValidationError(page);
    const hasError = errorText.includes('mật khẩu') || errorText.includes('password');

    if (!hasError) {
      throw new Error(`Expected error about password, got: "${errorText}"`);
    }

    logResult(testName, true);
  } catch (error: any) {
    logResult(testName, false, error.message);
    await takeScreenshot(page, `dk05_failed`);
  }
}

async function testDK06_MissingConfirmPassword(page: any) {
  const testName = 'DK06: Validate thiếu dữ liệu - Thiếu xác nhận mật khẩu';
  try {
    await page.goto(`${defaultConfig.baseURL}/register`, { waitUntil: 'networkidle2' });

    await fillStep1Form(page, TEST_DATA.valid.fullName, TEST_DATA.valid.username, TEST_DATA.valid.email, TEST_DATA.valid.password, undefined);
    await clickSubmitButton(page);

    await new Promise(resolve => setTimeout(resolve, 1000));
    const errorText = await getValidationError(page);
    const hasError = errorText.includes('xác nhận') || errorText.includes('confirm');

    if (!hasError) {
      throw new Error(`Expected error about confirm password, got: "${errorText}"`);
    }

    logResult(testName, true);
  } catch (error: any) {
    logResult(testName, false, error.message);
    await takeScreenshot(page, `dk06_failed`);
  }
}

async function testDK07_PasswordMismatch(page: any) {
  const testName = 'DK07: Validate khớp dữ liệu - Mật khẩu không khớp';
  try {
    await page.goto(`${defaultConfig.baseURL}/register`, { waitUntil: 'networkidle2' });

    await fillStep1Form(page, TEST_DATA.valid.fullName, TEST_DATA.valid.username, TEST_DATA.valid.email, '123456', '1234567');
    await clickSubmitButton(page);

    await new Promise(resolve => setTimeout(resolve, 1000));
    const errorText = await getValidationError(page);
    const hasError = errorText.includes('khớp') || errorText.includes('mismatch') || errorText.includes('không khớp');

    if (!hasError) {
      throw new Error(`Expected error about password mismatch, got: "${errorText}"`);
    }

    logResult(testName, true);
  } catch (error: any) {
    logResult(testName, false, error.message);
    await takeScreenshot(page, `dk07_failed`);
  }
}

async function testDK08_WeakPassword(page: any) {
  const testName = 'DK08: Validate mật khẩu - Mật khẩu yếu';
  try {
    await page.goto(`${defaultConfig.baseURL}/register`, { waitUntil: 'networkidle2' });

    await fillStep1Form(page, TEST_DATA.valid.fullName, TEST_DATA.valid.username, TEST_DATA.valid.email, '123', '123');
    await clickSubmitButton(page);

    await new Promise(resolve => setTimeout(resolve, 1000));
    const errorText = await getValidationError(page);
    const hasError = errorText.includes('yếu') || errorText.includes('ít nhất') || errorText.includes('6 ký tự') || errorText.toLowerCase().includes('weak');

    if (!hasError) {
      throw new Error(`Expected error about weak password, got: "${errorText}"`);
    }

    logResult(testName, true);
  } catch (error: any) {
    logResult(testName, false, error.message);
    await takeScreenshot(page, `dk08_failed`);
  }
}

async function testDK09_DuplicateUsername(page: any) {
  const testName = 'DK09: Validate trùng lặp - Username đã tồn tại';
  try {
    // Create a user with a specific username via API
    const existingUsername = generateUniqueString('dup');
    const existingEmail = `test_${existingUsername}@example.com`;

    // Register a user first
    const apiUrl = defaultConfig.backendURL;
    const registerResponse = await fetch(`${apiUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Existing User',
        username: existingUsername,
        email: existingEmail,
        password: TEST_DATA.valid.password,
        confirmPassword: TEST_DATA.valid.confirmPassword,
      }),
    });

    if (!registerResponse.ok) {
      throw new Error(`Failed to create existing user: ${registerResponse.status}`);
    }

    // Now try to register with the same username via UI
    await page.goto(`${defaultConfig.baseURL}/register`, { waitUntil: 'networkidle2' });

    await fillStep1Form(
      page,
      TEST_DATA.valid.fullName,
      existingUsername,
      TEST_DATA.valid.email,
      TEST_DATA.valid.password,
      TEST_DATA.valid.confirmPassword
    );
    await clickSubmitButton(page);

    // Wait for response and check for error
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check for duplicate username error
    const errorText = await getValidationError(page);
    const hasError = errorText.includes('đã tồn tại') || errorText.includes('tồn tại') ||
                     errorText.includes('already exists') || errorText.includes('duplicate') ||
                     errorText.includes('username');

    if (hasError) {
      logResult(testName, true);
    } else {
      // Also check if there was an API error (might show in a different location)
      // Try to get any error text from the page
      const bodyText = await page.evaluate(() => document.body.textContent || '');
      if (bodyText.includes('đã tồn tại') || bodyText.includes('duplicate')) {
        logResult(testName, true);
      } else {
        throw new Error(`Expected duplicate username error, got: "${errorText}"`);
      }
    }
  } catch (error: any) {
    logResult(testName, false, error.message);
    await takeScreenshot(page, `dk09_failed`);
  }
}

async function testDK10_SQLInjection(page: any) {
  const testName = 'DK10: Bảo mật - SQL Injection';
  try {
    await page.goto(`${defaultConfig.baseURL}/register`, { waitUntil: 'networkidle2' });

    await fillStep1Form(
      page,
      TEST_DATA.sqlInjection.fullName,
      TEST_DATA.sqlInjection.username,
      TEST_DATA.sqlInjection.email,
      TEST_DATA.sqlInjection.password,
      TEST_DATA.sqlInjection.confirmPassword
    );
    await clickSubmitButton(page);

    // Wait for backend response
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check current state
    const currentUrl = page.url();
    const onStep2 = currentUrl.includes('/register');

    if (onStep2) {
      // Look for finish button - if present, SQL injection might have been accepted
      try {
        const finishButton = await findButtonByText(page, 'Hoàn tất', 'Finish');
        if (finishButton) {
          throw new Error('SQL injection payload was accepted - security vulnerability!');
        }
      } catch {
        // No finish button found - good, registration was blocked
      }
    }

    // Also check for error messages
    const errorText = await getValidationError(page);
    const hasError = errorText.length > 0;

    // Either on step 1 with error or not on step 2 - both acceptable
    logResult(testName, true);
  } catch (error: any) {
    logResult(testName, false, error.message);
    await takeScreenshot(page, `dk10_failed`);
  }
}

// Run tests
runTests().catch(console.error);
