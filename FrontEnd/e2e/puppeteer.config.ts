import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

// Load .env.e2e.local file
dotenv.config({ path: '.env.e2e.local' });

export interface PuppeteerConfig {
  baseURL: string;           // Frontend URL (e.g., http://localhost:5173)
  backendURL: string;        // Backend API URL (e.g., http://localhost:8080)
  headless: boolean;
  slowMo: number;
  viewport: { width: number; height: number } | null;
  timeout: number;
  screenshotDir: string;
}

export const defaultConfig: PuppeteerConfig = {
  baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
  backendURL: process.env.E2E_BACKEND_URL || 'http://localhost:8080',
  headless: process.env.E2E_HEADLESS === 'true',
  slowMo: parseInt(process.env.E2E_SLOWMO || '0'),
  viewport: null, // Set to null to allow full window scale
  timeout: parseInt(process.env.E2E_TIMEOUT || '30000'),
  screenshotDir: 'e2e/screenshots',
};

export async function createBrowser(config: PuppeteerConfig = defaultConfig) {
  const browser = await puppeteer.launch({
    headless: config.headless,
    slowMo: config.slowMo,
    defaultViewport: null, // Forces layout to fill the window
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--start-maximized',
      '--window-size=1920,1080'
    ],
  });
  return browser;
}

export async function createPage(
  browser: puppeteer.Browser,
  config: PuppeteerConfig = defaultConfig
) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();

  if (config.viewport) {
    await page.setViewport(config.viewport);
  }

  // Set default timeout
  page.setDefaultTimeout(config.timeout);

  return { page, context };
}
