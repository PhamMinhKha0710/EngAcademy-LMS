import { Page, ElementHandle } from 'puppeteer';

export async function waitForSelector(
  page: Page,
  selector: string,
  options?: { timeout?: number; visible?: boolean }
) {
  const timeout = options?.timeout || 30000;
  const visible = options?.visible ?? false;

  await page.waitForSelector(selector, { timeout });

  if (visible) {
    const element = await page.$(selector);
    if (!element) {
      throw new Error(`Element ${selector} not found`);
    }
    const isVisible = await element.isIntersectingViewport();
    if (!isVisible) {
      throw new Error(`Element ${selector} is not visible`);
    }
  }
}

export async function waitForURL(
  page: Page,
  urlPattern: RegExp | string,
  options?: { timeout?: number }
) {
  const timeout = options?.timeout || 30000;
  await page.waitForFunction(
    (pattern) => {
      const href = window.location.href;
      if (typeof pattern === 'string') {
        return href.includes(pattern);
      }
      return pattern.test(href);
    },
    urlPattern,
    { timeout }
  );
}

export async function fillField(
  page: Page,
  selector: string,
  value: string
) {
  await waitForSelector(page, selector);

  // Clear the field first
  await page.click(selector, { clickCount: 3 }); // Triple click to select all
  await page.keyboard.press('Backspace');

  // Type the value
  await page.type(selector, value, { delay: 50 });

  // Dispatch change event
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) {
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, selector);
}

export async function clickElement(
  page: Page,
  selector: string
) {
  await waitForSelector(page, selector);
  await page.click(selector);
}

export async function getTextContent(
  page: Page,
  selector: string
): Promise<string> {
  await waitForSelector(page, selector);
  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Element ${selector} not found`);
  }
  return await page.evaluate(el => el.textContent?.trim() || '', element);
}

export async function getElementCount(
  page: Page,
  selector: string
): Promise<number> {
  const elements = await page.$$(selector);
  return elements.length;
}

export async function isElementVisible(
  page: Page,
  selector: string
): Promise<boolean> {
  try {
    const element = await page.$(selector);
    if (!element) return false;
    return await element.isIntersectingViewport();
  } catch {
    return false;
  }
}

export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export async function expectElementVisible(
  page: Page,
  selector: string,
  message?: string
) {
  const visible = await isElementVisible(page, selector);
  assert(visible, message || `Expected element "${selector}" to be visible`);
}

export async function expectElementNotVisible(
  page: Page,
  selector: string,
  message?: string
) {
  const visible = await isElementVisible(page, selector);
  assert(!visible, message || `Expected element "${selector}" to not be visible`);
}

export async function expectTextContains(
  page: Page,
  selector: string,
  expectedText: string,
  message?: string
) {
  const actualText = await getTextContent(page, selector);
  assert(
    actualText.includes(expectedText),
    message || `Expected text "${expectedText}" but got "${actualText}"`
  );
}

export async function expectElementDisabled(
  page: Page,
  selector: string,
  message?: string
) {
  const element = await page.$(selector);
  assert(element !== null, message || `Element ${selector} not found`);

  const isDisabled = await page.evaluate(el => (el as HTMLElement).disabled, element);
  assert(isDisabled, message || `Expected element "${selector}" to be disabled`);
}

export async function expectElementEnabled(
  page: Page,
  selector: string,
  message?: string
) {
  const element = await page.$(selector);
  assert(element !== null, message || `Element ${selector} not found`);

  const isDisabled = await page.evaluate(el => (el as HTMLElement).disabled, element);
  assert(!isDisabled, message || `Expected element "${selector}" to be enabled`);
}

export async function takeScreenshot(
  page: Page,
  name: string,
  screenshotDir?: string
) {
  try {
    const fs = await import('fs');
    const dir = screenshotDir || 'e2e/screenshots';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    await page.screenshot({
      path: `${dir}/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  } catch (e) {
    console.log(`Screenshot failed for ${name}:`, e);
  }
}

export function generateUniqueString(prefix: string = 'test'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export async function waitForXPath(
  page: Page,
  xpath: string,
  options?: { timeout?: number }
): Promise<ElementHandle | null> {
  const timeout = options?.timeout || 30000;
  return await page.waitForXPath(xpath, { timeout });
}

export async function findElementByXPath(
  page: Page,
  xpath: string
): Promise<ElementHandle | null> {
  try {
    return await page.$x(xpath);
  } catch {
    return null;
  }
}

// Try multiple selectors, return first that works
export async function trySelectors(
  page: Page,
  selectors: string[],
  action: 'click' | 'fill' | 'get',
  value?: string
): Promise<void> {
  for (const selector of selectors) {
    try {
      if (action === 'click') {
        await page.click(selector);
        return;
      } else if (action === 'fill') {
        await page.click(selector);
        await page.evaluate((el, val) => {
          el.value = val;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, await page.$(selector), value);
        return;
      } else if (action === 'get') {
        const text = await page.$eval(selector, el => el.textContent?.trim() || '');
        return text;
      }
    } catch (e) {
      // Try next selector
      continue;
    }
  }
  throw new Error(`All selectors failed: ${selectors.join(', ')}`);
}

// Find button by text content using XPath (like in register.spec.ts)
export async function findButtonByText(
  page: Page,
  ...texts: string[]
): Promise<ElementHandle> {
  for (const text of texts) {
    try {
      const xpath = `//button[contains(., '${text}')]`;
      const element = await page.waitForXPath(xpath, { timeout: 5000 });
      if (element) return element;
    } catch {
      // Continue to next text
    }
  }
  throw new Error(`Could not find button with any of these texts: ${texts.join(', ')}`);
}
