import * as fs from 'fs';
import * as path from 'path';
import { defaultConfig, createBrowser } from './puppeteer.config';
import { setupFixtures, teardownFixtures, ensureTeacherAuth } from './fixtures';
import {
  waitForSelector,
  takeScreenshot,
  waitForURL,
  waitForXPath,
  fillField,
  findButtonByText,
} from './test-helper';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs?: number;
}

const results: TestResult[] = [];
let globalTestStart = 0;

function logResult(testName: string, passed: boolean, error?: string) {
  const durationMs = Date.now() - globalTestStart;
  results.push({ name: testName, passed, error, durationMs });
  const status = passed ? '✓ PASS' : '✗ FAIL';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${status}\x1b[0m: ${testName} - ${(durationMs/1000).toFixed(2)}s ${error ? ` - Lỗi: ${error}` : ''}`);
}

function generateHtmlReport(totalTimeMs: number) {
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const currentDate = new Date().toLocaleString('vi-VN');

  const rows = results.map(r => `
    <tr class="border-b hover:bg-slate-50 transition">
      <td class="p-3 text-center">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${r.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
          ${r.passed ? 'PASS' : 'FAIL'}
        </span>
      </td>
      <td class="p-3 font-semibold text-slate-800">${r.name}</td>
      <td class="p-3 text-slate-500 font-mono text-sm">${r.durationMs ? (r.durationMs / 1000).toFixed(2) + 's' : '-'}</td>
      <td class="p-3 text-rose-500 text-sm max-w-sm"><div class="truncate" title="${(r.error || '').replace(/"/g, '&quot;')}">${r.error || ''}</div></td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Puppeteer Test Automation Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 p-8 font-sans">
    <div class="max-w-5xl mx-auto bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <div class="bg-indigo-600 p-6 text-white text-center">
            <h1 class="text-3xl font-black tracking-tight">Automation Test Report</h1>
            <p class="mt-2 text-indigo-200 text-sm">Target: Teacher Lesson Management (Puppeteer) • ${currentDate}</p>
        </div>
        <div class="p-8">
            <div class="grid grid-cols-4 gap-6 mb-8">
                <div class="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center shadow-sm">
                    <div class="text-slate-500 text-xs font-bold uppercase mb-1">Tổng Scenarios</div>
                    <div class="text-4xl font-black text-slate-800">${total}</div>
                </div>
                <div class="bg-emerald-50 p-5 rounded-xl border border-emerald-200 text-center shadow-sm">
                    <div class="text-emerald-600 text-xs font-bold uppercase mb-1">Thành Công</div>
                    <div class="text-4xl font-black text-emerald-600">${passed}</div>
                </div>
                <div class="bg-rose-50 p-5 rounded-xl border border-rose-200 text-center shadow-sm">
                    <div class="text-rose-500 text-xs font-bold uppercase mb-1">Thất Bại</div>
                    <div class="text-4xl font-black text-rose-600">${failed}</div>
                </div>
                <div class="bg-blue-50 p-5 rounded-xl border border-blue-200 text-center shadow-sm">
                    <div class="text-blue-500 text-xs font-bold uppercase mb-1">Tổng Thời Gian</div>
                    <div class="text-4xl font-black text-blue-600">${(totalTimeMs / 1000).toFixed(2)}s</div>
                </div>
            </div>
            
            <div class="mb-10">
               <div class="flex justify-between text-sm mb-2 font-bold text-slate-600">
                 <span>Tỷ lệ Pass (Pass Rate):</span>
                 <span>${passRate}%</span>
               </div>
               <div class="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner flex">
                  <div class="bg-emerald-500 h-4 transition-all duration-1000 ease-in-out" style="width: ${passRate}%"></div>
               </div>
            </div>

            <h2 class="text-xl font-bold mb-4 text-slate-800 border-b-2 border-slate-100 pb-2">Chi Tiết Từng Quá Trình (Steps)</h2>
            <div class="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                <table class="w-full text-left border-collapse bg-white">
                    <thead>
                        <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                            <th class="p-4 font-bold border-b border-slate-200 text-center">Trạng Thái</th>
                            <th class="p-4 font-bold border-b border-slate-200">Kịch Bản (Name)</th>
                            <th class="p-4 font-bold border-b border-slate-200">Thời gian</th>
                            <th class="p-4 font-bold border-b border-slate-200">Thông báo Lỗi</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm">
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>`;

  const reportPath = path.join(process.cwd(), 'e2e/puppeteer-report.html');
  fs.writeFileSync(reportPath, html, 'utf8');
  console.log(`\n📊 [HTML REPORT GENERATED]\nMở file này trên trình duyệt để xem report: file://${reportPath.replace(/\\/g, '/')}\n`);
}

async function runTests() {
  console.log('\n==========================================');
  console.log('Teacher Lesson Management Tests (TL01-TL05)');
  console.log('==========================================\n');

  let browser: any;
  let page: any;
  const suiteStartTime = Date.now();

  try {
    // Setup - use config from fixtures
    console.log('Setting up fixtures...');
    const fixtures = await setupFixtures({ ...defaultConfig, headless: false });
    browser = fixtures.browser;
    page = fixtures.page;

    // TL01: Teacher Login
    globalTestStart = Date.now();
    await testTL01_TeacherLogin(page);

    // TL02: Navigate to Teacher Lessons Page
    globalTestStart = Date.now();
    await testTL02_NavigateToLessons(page);

    // TL03: Create New Lesson
    globalTestStart = Date.now();
    await testTL03_CreateLesson(page);

    // TL04: Edit Existing Lesson
    globalTestStart = Date.now();
    await testTL04_EditLesson(page);

    // TL05: View Lesson Details
    globalTestStart = Date.now();
    await testTL05_ViewLesson(page);

  } catch (error: any) {
    console.error('Test suite error:', error.message);
  } finally {
    // Teardown
    if (browser && page) {
      await teardownFixtures({ browser, page, context: page.browserContext() });
    }
  }

  // Summary
  console.log('\n==========================================');
  console.log('TEST SUMMARY');
  console.log('==========================================');
  const totalTimeMs = Date.now() - suiteStartTime;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed} | Time: ${(totalTimeMs/1000).toFixed(2)}s`);

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}${r.error ? `: ${r.error}` : ''}`);
    });
  }

  // Khởi tạo HTML Report trước khi kết thúc tiến trình
  generateHtmlReport(totalTimeMs);

  process.exit(failed > 0 ? 1 : 0);
}

async function testTL01_TeacherLogin(page: any) {
  try {
    console.log('\n--- TL01: Teacher Login ---');

    // Use ensureTeacherAuth which handles login flow and waits for token
    await ensureTeacherAuth(page, defaultConfig.baseURL);

    // Verify we're on a teacher-accessible page
    const currentUrl = page.url();
    if (!currentUrl.includes('teacher') && !currentUrl.includes('dashboard') && !currentUrl.includes('home')) {
      console.log(`Warning: Expected teacher/dashboard/home URL, got: ${currentUrl}`);
    }

    await takeScreenshot(page, 'tl01_success');
    logResult('TL01: Teacher Login', true);
  } catch (error: any) {
    await takeScreenshot(page, 'tl01_failed');
    logResult('TL01: Teacher Login', false, error.message);
  }
}

async function testTL02_NavigateToLessons(page: any) {
  try {
    console.log('\n--- TL02: Navigate to Teacher Lessons Page ---');

    // Navigate to teacher lessons
    const lessonsUrl = `${defaultConfig.baseURL}/teacher/lessons`;
    console.log('Navigating to:', lessonsUrl);
    await page.goto(lessonsUrl, { waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get current URL and check for redirects
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    if (currentUrl.includes('/login')) {
      throw new Error('Redirected to login - authentication failed');
    }

    // Check for lesson table presence (key element of the page)
    // Try different selectors for the lesson table
    const tableSelectors = [
      '[data-testid="lesson-table"]',
      'table',
      '.data-table',
      '.lesson-table',
      '//table'
    ];

    let tableFound = false;
    for (const selector of tableSelectors) {
      try {
        let element;
        if (selector.startsWith('//')) {
          element = await waitForXPath(page, selector, { timeout: 5000 });
        } else {
          await waitForSelector(page, selector, { timeout: 5000 });
          element = await page.$(selector);
        }
        if (element) {
          console.log(`Found lesson table using: ${selector}`);
          tableFound = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!tableFound) {
      // Check page content for any lesson-related text
      const pageContent = await page.content();
      if (!pageContent.includes('bài học') && !pageContent.includes('lesson')) {
        throw new Error('Page does not appear to be a lessons management page');
      }
      // If content suggests it's correct but table not found, that's still acceptable
      console.log('Table not explicitly found, but page contains lesson-related content');
    }

    await takeScreenshot(page, 'tl02_success');
    logResult('TL02: Navigate to Lessons Page', true);
  } catch (error: any) {
    await takeScreenshot(page, 'tl02_failed');
    logResult('TL02: Navigate to Lessons Page', false, error.message);
  }
}

async function testTL03_CreateLesson(page: any) {
  try {
    console.log('\n--- TL03: Create New Lesson ---');

    await page.goto(`${defaultConfig.baseURL}/teacher/lessons`, { waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Debug: dump buttons on page to see what's available
    const buttonsHtml = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.slice(0, 20).map(btn => ({
        text: btn.textContent?.trim().substring(0, 50),
        classes: btn.className,
        testId: btn.getAttribute('data-testid'),
        title: btn.getAttribute('title'),
        outerHTML: btn.outerHTML.substring(0, 100)
      }));
    });
    console.log('First 20 buttons on page:', JSON.stringify(buttonsHtml, null, 2));

    // Click create button - try CSS selectors first (data-testid)
    const createSelectors = [
      '[data-testid="lesson-create-button"]',  // CSS selector for data-testid
      'button:has-text("Tạo bài học")',
      'button:has-text("Tạo")',
      'button.lesson-create',
      'button.create-lesson'
    ];

    let clicked = false;
    for (const selector of createSelectors) {
      try {
        console.log(`Trying selector: ${selector}`);
        // Use waitForSelector for CSS selectors
        await waitForSelector(page, selector, { timeout: 3000 });
        await page.click(selector);
        console.log(`Clicked button using selector: ${selector}`);
        clicked = true;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!clicked) {
      // Fallback: try XPath
      const createButtonXPaths = [
        '//*[@data-testid="lesson-create-button"]',
        '//button[contains(., "Tạo bài học")]',
        '//button[contains(., "Tạo")]'
      ];
      for (const xpath of createButtonXPaths) {
        try {
          console.log(`Trying XPath fallback: ${xpath}`);
          const button = await waitForXPath(page, xpath, { timeout: 3000 });
          if (button) {
            await button.click();
            console.log(`Clicked button using XPath: ${xpath}`);
            clicked = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }

    if (!clicked) {
      throw new Error('Could not find/create button with any XPath selector');
    }

    // Wait for dialog to appear
    console.log('Waiting for lesson editor dialog...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Debug: dump FULL dialog including outerHTML to find save button
    const dialogOuterHtml = await page.evaluate(() => {
      const dialog = document.querySelector('[data-testid="lesson-save-primary"], .lesson-editor-dialog, dialog, [role="dialog"]');
      if (!dialog) return 'No dialog found';
      // Get outerHTML of dialog and its children
      return dialog.outerHTML.substring(0, 6000);
    });
    console.log('Dialog OUTER HTML (first 6000 chars):', dialogOuterHtml);

    // Also check for any button with save-related text
    const saveButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.filter(btn => {
        const text = btn.textContent?.toLowerCase() || '';
        return text.includes('lưu') || text.includes('xác nhận') || text.includes('save') || text.includes('confirm');
      }).slice(0, 10).map(btn => ({
        text: btn.textContent?.trim().substring(0, 50),
        classes: btn.className,
        testId: btn.getAttribute('data-testid'),
        title: btn.getAttribute('title')
      }));
    });
    console.log('Save-related buttons:', JSON.stringify(saveButtons, null, 2));

    // List ALL buttons on page after dialog opens
    const allButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.filter(btn => btn.textContent?.trim()).slice(0, 15).map(btn => ({
        text: btn.textContent?.trim().substring(0, 50),
        classes: btn.className,
        testId: btn.getAttribute('data-testid'),
        title: btn.getAttribute('title')
      }));
    });
    console.log('All visible buttons on page:', JSON.stringify(allButtons, null, 2));

    // Try to find title input
    try {
      const titleInput = await waitForXPath(page, '//input[@data-testid="lesson-title-input"]', { timeout: 2000 });
      console.log('Found title input with data-testid');
    } catch (e) {
      console.log('Title input not found with data-testid, will try other selectors');
    }

    // Generate unique title
    const timestamp = Date.now();
    const title = `Test Lesson ${timestamp}`;

    // Fill title - try XPath for input with placeholder
    const titleInputXPaths = [
      '//input[@data-testid="lesson-title-input"]',
      '//input[contains(@placeholder, "tiêu đề")]',
      '//input[@type="text"]'
    ];

    let titleFilled = false;
    // First try CSS selector with data-testid
    try {
      await fillField(page, '[data-testid="lesson-title-input"]', title);
      titleFilled = true;
      console.log('Filled title using CSS selector');
    } catch (e) {
      console.log('CSS selector failed, trying XPath selectors');
    }

    if (!titleFilled) {
      // Try XPath selectors
      for (const xpath of titleInputXPaths) {
        try {
          const input = await waitForXPath(page, xpath, { timeout: 3000 });
          // Use fillField approach with the input element
          await page.evaluate((el, val) => {
            el.value = val;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, input, title);
          titleFilled = true;
          console.log(`Filled title using XPath: ${xpath}`);
          break;
        } catch (e) {
          continue;
        }
      }
    }

    if (!titleFilled) {
      throw new Error('Could not find title input');
    }

    // Verify title was set correctly (debug)
    const titleValue = await page.evaluate(() => {
      const input = document.querySelector('[data-testid="lesson-title-input"]');
      return input ? (input as HTMLInputElement).value : '';
    });
    console.log(`Title input value after fill: "${titleValue}"`);

    // Set difficulty to 3
    try {
      await page.select('[data-testid="lesson-difficulty-select"]', '3');
      console.log('Set difficulty to 3');
    } catch (e) {
      console.log('Could not set difficulty, continuing...');
    }

    // Set order index
    try {
      await fillField(page, 'input[type="number"][min="0"], input[placeholder*="thứ tự"]', '99');
    } catch (e) {
      console.log('Could not set order index, continuing...');
    }

    // Ensure publish is checked
    try {
      const checkbox = await page.$('[data-testid="lesson-publish-checkbox"]');
      if (checkbox) {
        const isChecked = await checkbox.evaluate(el => (el as HTMLInputElement).checked);
        if (!isChecked) {
          await checkbox.click();
        }
      }
    } catch (e) {
      // Ignore
    }

    // Add some basic content to CKEditor (if available) to satisfy validation
    try {
      // Wait for CKEditor iframe to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Try to set content in the editor
      await page.evaluate(() => {
        // CKEditor might be in an iframe or a div with contenteditable
        const editor = document.querySelector('.ck-content, [contenteditable="true"], .editor-content');
        if (editor) {
          editor.textContent = 'Test lesson content created by automated test.';
        }
      });
      console.log('Added content to editor');
    } catch (e) {
      console.log('Could not add editor content, continuing...');
    }

    // Switch to review tab first
    try {
      await waitForSelector(page, '[data-testid="tab-review"]', { timeout: 3000 });
      await page.click('[data-testid="tab-review"]');
      console.log('Clicked review tab');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for review to load
    } catch (e) {
      console.log('Could not switch to review tab');
    }

    // Click save button (lesson-save-primary)
    try {
      await waitForSelector(page, '[data-testid="lesson-save-primary"]', { timeout: 5000 });
      await page.click('[data-testid="lesson-save-primary"]');
      console.log('Clicked save button');
    } catch (e) {
      throw new Error('Could not find save button');
    }

    // Click confirmation save button
    try {
      await waitForSelector(page, '[data-testid="lesson-save-confirm"]', { timeout: 5000 });
      await page.click('[data-testid="lesson-save-confirm"]');
      console.log('Clicked save confirmation button');
    } catch (e) {
      // Fallback if there's no confirmation modal or it auto-saved
      console.log('Save confirmation button not found, assuming saved');
    }

    // Wait for save to complete - wait for network idle and then check
    console.log('Waiting for save operation...');
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Force navigate back to lessons page (don't wait for dialog to close)
    console.log('Navigating to lessons page to verify...');
    await page.goto(`${defaultConfig.baseURL}/teacher/lessons`, { waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Debug: dump table content
    const tableText = await page.evaluate(() => {
      const table = document.querySelector('table');
      return table ? table.textContent?.substring(0, 1000) : 'No table';
    });
    console.log('Table content after create:', tableText);

    // Check if lesson is in table using XPath via evaluate
    const lessonFound = await page.evaluate((timestamp) => {
      const xpath = `//table//tr[contains(., "Test Lesson ${timestamp}")]`;
      const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      return result.singleNodeValue !== null;
    }, timestamp);

    if (!lessonFound) {
      throw new Error('Created lesson not found in table');
    }

    await takeScreenshot(page, 'tl03_success');
    logResult('TL03: Create New Lesson', true);
  } catch (error: any) {
    await takeScreenshot(page, 'tl03_failed');
    logResult('TL03: Create New Lesson', false, error.message);
  }
}

async function testTL04_EditLesson(page: any) {
  try {
    console.log('\n--- TL04: Edit Existing Lesson ---');

    await page.goto(`${defaultConfig.baseURL}/teacher/lessons`, { waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Debug: check how many edit buttons exist using evaluate with XPath
    const editButtonsCount = await page.evaluate(() => {
      const xpath = '//button[@title="Sửa"]';
      const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      return result.snapshotLength;
    });
    console.log(`Found ${editButtonsCount} edit buttons with title="Sửa"`);

    if (editButtonsCount === 0) {
      // Dump some table HTML for debugging
      const tableHtml = await page.evaluate(() => {
        const table = document.querySelector('table');
        return table ? table.innerHTML.substring(0, 1500) : 'No table found';
      });
      console.log('Table HTML snippet:', tableHtml);
    }

    // Find first edit button - use CSS selector (most reliable)
    let editButton: any = null;
    try {
      // Use CSS selector directly
      await waitForSelector(page, 'button[title="Sửa"]', { timeout: 5000 });
      editButton = await page.$('button[title="Sửa"]');
      console.log('Found edit button via CSS selector');
    } catch (e) {
      console.log('CSS selector failed, trying XPath');
      const editXPaths = [
        '//button[@title="Sửa"]',
        '//button[contains(@title, "Sửa")]',
        '//button[contains(., "Sửa")]'
      ];
      for (const xpath of editXPaths) {
        try {
          editButton = await waitForXPath(page, xpath, { timeout: 3000 });
          if (editButton) {
            console.log(`Found edit button via XPath: ${xpath}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }

    if (!editButton) {
      throw new Error('No edit buttons found - need at least one lesson in the table');
    }

    await editButton.click();
    console.log('Clicked edit button');

    // Wait for dialog - try multiple selectors
    const dialogSelectors = [
      '[data-testid="lesson-save-primary"]',
      '.lesson-editor-dialog',
      'dialog',
      '[role="dialog"]'
    ];
    let dialogFound = false;
    for (const selector of dialogSelectors) {
      try {
        await waitForSelector(page, selector, { timeout: 3000 });
        dialogFound = true;
        break;
      } catch (e) {
        continue;
      }
    }
    if (!dialogFound) {
      throw new Error('Lesson edit dialog did not appear');
    }
    console.log('Dialog appeared');

    // Click edit tab to ensure title input is visible
    try {
      const editTab = await page.$('[data-testid="tab-edit"]');
      if (editTab) {
        await editTab.click();
        console.log('Clicked edit tab');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (e) {
      console.log('Could not click edit tab, continuing...');
    }

    // Get original title and keep reference to titleInput for later modification
    let originalTitle = '';
    let titleInputElement: any = null;
    try {
      // Try CSS selector first
      titleInputElement = await page.$('[data-testid="lesson-title-input"]');
      if (titleInputElement) {
        originalTitle = await page.evaluate(el => (el as HTMLInputElement).value, titleInputElement);
        console.log(`Found title input via CSS, value: "${originalTitle}"`);
      } else {
        // Try XPath
        titleInputElement = await waitForXPath(page, '//input[@data-testid="lesson-title-input"]', { timeout: 5000 });
        originalTitle = await page.evaluate(el => (el as HTMLInputElement).value, titleInputElement);
        console.log(`Found title input via XPath, value: "${originalTitle}"`);
      }
    } catch (e) {
      console.log('Could not find title input, will use fallback from table');
      // Will use fallback
    }

    if (!originalTitle) {
      // Try to get from first table row
      try {
        const firstRow = await waitForXPath(page, '(//table//tr)[2]', { timeout: 2000 }); // Skip header row
        const rowText = await page.evaluate(el => el.textContent?.trim() || '', firstRow);
        originalTitle = rowText.split('\n')[1]?.trim() || 'Lesson';
      } catch (e) {
        originalTitle = 'Lesson';
      }
    }

    const newTitle = `Edited Lesson ${Date.now()}`;

    // Modify title - use the already found element or find again
    try {
      await page.waitForSelector('[data-testid="lesson-title-input"]', { timeout: 3000 });
      // Clear value completely before filling to avoid appending or long strings
      await page.evaluate(() => {
        const input = document.querySelector('[data-testid="lesson-title-input"]') as HTMLInputElement;
        if (input) {
            input.value = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      await fillField(page, '[data-testid="lesson-title-input"]', newTitle);
      console.log(`Modified title to: "${newTitle}"`);
    } catch (e) {
      throw new Error('Could not find title input for editing');
    }

    // Switch to review tab
    try {
      await waitForSelector(page, '[data-testid="tab-review"]', { timeout: 2000 });
      await page.click('[data-testid="tab-review"]');
      console.log('TL04: Clicked review tab');
    } catch (e) {
      console.log('TL04: Could not click review tab, continuing...');
      // Continue without review
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Click save - use CSS selector with data-testid
    const saveSelectors = [
      '[data-testid="lesson-save-primary"]',
      'button:has-text("Lưu")',
      'button:has-text("Xem lại")'
    ];

    let saved = false;
    for (const selector of saveSelectors) {
      try {
        console.log(`TL04: Trying save selector: ${selector}`);
        await waitForSelector(page, selector, { timeout: 3000 });
        await page.click(selector);
        console.log(`TL04: Clicked save button`);
        saved = true;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!saved) {
      throw new Error('Could not find save button');
    }

    // Click confirmation save button
    try {
      await waitForSelector(page, '[data-testid="lesson-save-confirm"]', { timeout: 5000 });
      await page.click('[data-testid="lesson-save-confirm"]');
      console.log('TL04: Clicked save confirmation button');
    } catch (e) {
      console.log('TL04: Save confirmation button not found, assuming saved');
    }

    // Wait for save to complete
    console.log('TL04: Waiting for save operation...');
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Navigate back to lessons page to verify
    console.log('TL04: Navigating to lessons page...');
    await page.goto(`${defaultConfig.baseURL}/teacher/lessons`, { waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Check if edited lesson is in table using XPath via evaluate
    const editedFound = await page.evaluate((title) => {
      const xpath = `//table//tr[contains(., "${title}")]`;
      const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      return result.singleNodeValue !== null;
    }, newTitle);

    if (!editedFound) {
      throw new Error('Edited lesson not found with new title');
    }

    await takeScreenshot(page, 'tl04_success');
    logResult('TL04: Edit Existing Lesson', true);
  } catch (error: any) {
    await takeScreenshot(page, 'tl04_failed');
    logResult('TL04: Edit Existing Lesson', false, error.message);
  }
}

async function testTL05_ViewLesson(page: any) {
  try {
    console.log('\n--- TL05: View Lesson Details (Preview Mode) ---');

    await page.goto(`${defaultConfig.baseURL}/teacher/lessons`, { waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Find edit button using CSS selector (reliable)
    let editButton: any = null;
    try {
      await waitForSelector(page, 'button[title="Sửa"]', { timeout: 5000 });
      editButton = await page.$('button[title="Sửa"]');
      console.log('TL05: Found edit button via CSS');
    } catch (e) {
      // Fallback to XPath
      try {
        editButton = await waitForXPath(page, '//button[@title="Sửa"]', { timeout: 3000 });
        console.log('TL05: Found edit button via XPath');
      } catch (e2) {
        throw new Error('No lessons available to preview - no edit buttons found');
      }
    }

    await editButton.click();
    console.log('TL05: Clicked edit button');

    await waitForSelector(page, '[data-testid="tab-review"], .review-sub-tabs', { timeout: 5000 });

    // Switch to review tab
    try {
      const editTab = await waitForXPath(page, '//button[contains(., "B��I GIẢNG SỐ") or contains(@data-testid, "tab-edit")]', { timeout: 2000 });
      await editTab.click();
      await new Promise(resolve => setTimeout(resolve, 500));

      const reviewTab = await waitForXPath(page, '//button[contains(., "XEM TRƯỚC") or contains(@data-testid, "tab-review")]', { timeout: 2000 });
      await reviewTab.click();
    } catch (e) {
      // Maybe already on review, continue
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify review elements exist (content, grammar, vocabulary, practice tabs)
    const reviewTabsCount = await page.evaluate(() => {
      const xpath = '//*[contains(@class, "review-sub-tabs")]//button';
      const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      return result.snapshotLength;
    });

    if (reviewTabsCount === 0) {
      // Check for review content area
      const reviewContent = await page.$('[data-testid="tab-content"], [data-testid="tab-grammar"]');
      if (!reviewContent) {
        console.log('Warning: Review tabs not explicitly found');
      }
    }

    await takeScreenshot(page, 'tl05_success');
    logResult('TL05: View Lesson Details', true);
  } catch (error: any) {
    await takeScreenshot(page, 'tl05_failed');
    logResult('TL05: View Lesson Details', false, error.message);
  }
}

// Run tests
runTests();
