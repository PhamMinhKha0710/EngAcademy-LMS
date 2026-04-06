import puppeteer from 'puppeteer';
import { defaultConfig, createBrowser, createPage, PuppeteerConfig } from './puppeteer.config';
import { waitForURL, fillField, clickElement } from './test-helper';

export interface Fixtures {
  page: puppeteer.Page;
  browser: puppeteer.Browser;
  context: puppeteer.BrowserContext;
}

export async function setupFixtures(config: PuppeteerConfig = defaultConfig): Promise<Fixtures> {
  const browser = await createBrowser(config);
  const { page, context } = await createPage(browser, config);

  return { page, browser, context };
}

export async function teardownFixtures(fixtures: Fixtures) {
  await fixtures.context.close();
  await fixtures.browser.close();
}

export async function loginTeacher(
  page: puppeteer.Page,
  email: string,
  password: string,
  baseURL: string = defaultConfig.baseURL
) {
  // Navigate to login page
  await page.goto(`${baseURL}/login`, { waitUntil: 'domcontentloaded' });

  // Wait for page to be fully rendered
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Verify inputs exist
  const usernameExists = await page.$('#username');
  const passwordExists = await page.$('#password');
  if (!usernameExists || !passwordExists) {
    throw new Error('Login form inputs not found on page');
  }

  // Fill login form
  await fillField(page, '#username', email);
  await fillField(page, '#password', password);

  // Click login button
  await clickElement(page, 'button[type="submit"]');

  // Wait for authentication using waitForFunction (more reliable)
  await page.waitForFunction(() => {
    try {
      const authData = localStorage.getItem('auth-storage');
      if (!authData) return false;
      const parsed = JSON.parse(authData);
      return parsed?.state?.isAuthenticated === true && !!parsed?.state?.accessToken;
    } catch {
      return false;
    }
  }, { timeout: 30000 });

  // Wait a bit for any redirects to settle
  await new Promise(resolve => setTimeout(resolve, 2000));

  return page;
}

export async function ensureTeacherAuth(
  page: puppeteer.Page,
  baseURL: string = defaultConfig.baseURL
) {
  const email = process.env.E2E_TEACHER_EMAIL;
  const password = process.env.E2E_TEACHER_PASSWORD;

  if (!email || !password) {
    throw new Error('E2E_TEACHER_EMAIL and E2E_TEACHER_PASSWORD must be set in environment');
  }

  // Check if already logged in (with error handling for security restrictions)
  let hasToken = false;
  try {
    const token = await page.evaluate(() => {
      try {
        return localStorage.getItem('accessToken');
      } catch (e) {
        return null;
      }
    });
    hasToken = token !== null;
  } catch (e) {
    // localStorage access denied, assume not logged in
    hasToken = false;
  }

  if (!hasToken) {
    await page.goto(baseURL);
    await loginTeacher(page, email, password, baseURL);
  }

  return page;
}

// No stubbing - tests use real backend API
