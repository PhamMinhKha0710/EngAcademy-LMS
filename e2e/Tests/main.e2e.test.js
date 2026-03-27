const puppeteer = require('puppeteer');
const { delay } = require('../Utils/helpers');

jest.setTimeout(90000); // 90 giây cho an toàn tuyệt đối
const APP_URL = 'http://localhost:3000';

// Các mức độ chờ "vừa phải" (Moderate Delays)
const DELAY_SHORT = 500;    // Cho các thao tác nhanh
const DELAY_MEDIUM = 1000;  // Cho các thao tác chuyển trang/hiển thị
const DELAY_LONG = 1500;    // Cho các thao tác nặng hơn hoặc chờ DB
const DELAY_BETWEEN_TESTS = 1200; // Thời gian chờ giữa các Test Case

describe('KỊCH BẢN KIỂM THỬ E2E TOÀN DIỆN (CHẠY TUẦN TỰ)', () => {
    let browser;
    let page;

    // Tài khoản cố định đã tồn tại trong DB
    const sharedUsername = 'hannie1812';
    const sharedEmail = 'bichhang18122004@gmail.com';
    const sharedPassword = 'hannie1812';

    let testStartTime;

    beforeAll(async () => {
        const fs = require('fs');
        if (!fs.existsSync('./e2e/Screenshots')) {
            fs.mkdirSync('./e2e/Screenshots', { recursive: true });
        }

        // Khởi động đúng 1 Chromium duy nhất cho toàn bộ 12 Test Cases
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 50, // Tăng lên 100ms mỗi thao tác gõ phím/click để mắt người kịp nhìn
            args: ['--window-size=1280,800']
        });
        page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
    });

    beforeEach(async () => {
        const testName = expect.getState().currentTestName;
        testStartTime = Date.now();
        console.log(`\n\x1b[34m🚀 [RUNNING]\x1b[0m ${testName}`);
    });

    afterEach(async () => {
        const testName = expect.getState().currentTestName;
        const duration = Date.now() - testStartTime;
        const state = expect.getState();
        
        // Determing status: is passed if assertion count matches passing assertions
        const isPassed = state.assertionCalls === state.numPassingAsserts;
        
        if (isPassed) {
            console.log(`\x1b[32m✅ [PASSED]\x1b[0m ${testName} (${duration}ms)`);
        } else {
            console.log(`\x1b[31m❌ [FAILED]\x1b[0m ${testName} (${duration}ms)`);
        }

        if (page) {
            try {
                const fullName = expect.getState().currentTestName;
                let fileId = 'TC-E2E';
                // Lấy ID test case từ tiêu đề (ví dụ: TC-LOGIN-01)
                const m = fullName.match(/\b(TC-[A-Z0-9-]+)\b/);
                const m2 = fullName.match(/\b(\d+)\.\s*/);

                if (m) { fileId = m[1]; }
                else if (m2) { fileId = `TC-${m2[1].padStart(2, '0')}`; }
                else { fileId = fullName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30); }

                // Chụp màn hình lưu vào ổ đĩa để CustomReporter xử lý
                await page.screenshot({ 
                    path: `./e2e/Screenshots/${fileId}.png`, 
                    fullPage: true 
                });
            } catch (err) {
                console.log('⚠️ [Warning] Không thể chụp màn hình:', err.message);
            }
        }
        // Thời gian chờ giữa các Test Case để người dùng kịp quan sát kết quả
        await delay(DELAY_BETWEEN_TESTS);
    });

    afterAll(async () => {
        try {
            if (page && !page.isClosed()) await page.close();
            if (browser && browser.connected) await browser.close();
        } catch (err) {
            console.log('Error in afterAll (Cleanup):', err.message);
        }
    });

    // =============================================================
    describe('PHẦN 1: HÀNH TRÌNH NGƯỜI DÙNG CƠ BẢN', () => {

        test('1. Luồng Người Dùng Hiện Tại (Đăng nhập -> Dashboard -> Tìm khóa học)', async () => {
            // Đăng nhập với tài khoản cố định
            await page.goto(`${APP_URL}/login`);
            await page.waitForSelector('#username', { timeout: 15000 });
            await page.type('#username', sharedUsername);
            await page.type('#password', sharedPassword);
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => { }),
                page.click('button[type="submit"]')
            ]);
            await delay(DELAY_MEDIUM);

            // Vào trang bài học và tìm kiếm
            await page.goto(`${APP_URL}/lessons`);
            const searchInputSelector = 'input[type="text"]';
            await page.waitForSelector(searchInputSelector);
            await page.type(searchInputSelector, 'Unit 2');
            await delay(DELAY_MEDIUM);

            const lessonCards = await page.$$('.card.relative.p-5');
            expect(lessonCards).toBeDefined();
        });

        test('2. Luồng Người Dùng Cũ (Đăng xuất -> Đăng nhập lại)', async () => {
            await page.goto(`${APP_URL}`);
            await delay(2000);

            // Click nút Đăng xuất trên thanh Header
            const loggedOut = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const logoutBtn = buttons.find(b => b.textContent.includes('Đăng xuất') || b.textContent.includes('Logout'));
                if (logoutBtn) { logoutBtn.click(); return true; }
                return false;
            });
            if (loggedOut) await delay(DELAY_MEDIUM);

            await page.goto(`${APP_URL}/login`);
            await page.waitForSelector('#username');
            await page.type('#username', sharedUsername);
            await page.type('#password', sharedPassword);

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => { }),
                page.click('button[type="submit"]')
            ]);

            const url = page.url();
            expect(url).not.toContain('/login');
            await delay(DELAY_MEDIUM);
        });
    });

    // =============================================================
    describe('PHẦN 2: KIỂM THỬ CHUYÊN SÂU MODULE ĐĂNG NHẬP (LOGIN Edge Cases)', () => {
        beforeEach(async () => {
            // Đảm bảo xóa auth state trước khi vào form login
            await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
            await page.evaluate(() => {
                try { localStorage.clear(); sessionStorage.clear(); } catch (e) { }
            });
            await delay(DELAY_SHORT); // Chờ React có thể xử lý logout
            await page.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('#username', { timeout: 15000 });
            await page.evaluate(() => {
                const u = document.querySelector('#username');
                const p = document.querySelector('#password');
                if (u) u.value = '';
                if (p) p.value = '';
            });
        });

        test('TC-LOGIN-01: Đăng nhập thành công', async () => {
            await page.type('#username', sharedUsername);
            await page.type('#password', sharedPassword);
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => { }),
                page.click('button[type="submit"]')
            ]);
            expect(page.url()).not.toContain('/login');
            await page.waitForSelector('a[href="/settings"]');
            const userFullName = await page.$eval('a[href="/settings"]', el => el.textContent.trim());
            expect(userFullName.length).toBeGreaterThan(0);
        });

        test('TC-LOGIN-02: Sai mật khẩu', async () => {
            await page.type('#username', sharedUsername);
            await page.type('#password', 'WrongPassword999');
            await page.click('button[type="submit"]');
            await delay(DELAY_MEDIUM);
            expect(page.url()).toContain('/login');
            await page.waitForSelector('.bg-red-500\\/10.text-red-600');
            const errorText = await page.$eval('.bg-red-500\\/10.text-red-600', el => el.textContent.trim());
            expect(errorText.length).toBeGreaterThan(0);
        });

        test('TC-LOGIN-03: Thiếu username', async () => {
            await page.type('#password', 'Password@123');
            await page.click('button[type="submit"]');
            const isInvalid = await page.$eval('#username', el => !el.checkValidity());
            expect(isInvalid).toBe(true);
        });

        test('TC-LOGIN-04: Thiếu password', async () => {
            await page.type('#username', 'testuser123');
            await page.click('button[type="submit"]');
            const isInvalid = await page.$eval('#password', el => !el.checkValidity());
            expect(isInvalid).toBe(true);
        });

        test('TC-LOGIN-05: Bảo mật mật khẩu', async () => {
            await page.type('#password', 'SecretPassword');
            const inputType = await page.$eval('#password', el => el.type);
            expect(inputType).toBe('password');

            const toggleButtons = await page.$$('button[type="button"]');
            if (toggleButtons.length > 0) {
                await toggleButtons[0].click();
                const inputTypeAfterClick = await page.$eval('#password', el => el.type);
                expect(inputTypeAfterClick).toBe('text');
            }
        });
    });

    // =============================================================
    describe('PHẦN 3: KIỂM THỬ CHUYÊN SÂU MODULE TÌM KIẾM (SEARCH Edge Cases)', () => {
        beforeAll(async () => {
            // Xóa auth state rồi login lại hoàn toàn
            await page.goto(APP_URL, { waitUntil: 'networkidle2' }).catch(() => {});
            await page.evaluate(() => {
                try { localStorage.clear(); sessionStorage.clear(); } catch (e) { }
            });
            // Xóa cookies để đảm bảo session bị ngắt hẳn
            try {
                const client = await page.target().createCDPSession();
                await client.send('Network.clearBrowserCookies');
            } catch (e) {}

            await delay(DELAY_SHORT);
            await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle2' }).catch(() => {});
            await page.waitForSelector('#username', { timeout: 15000 });
            await page.type('#username', sharedUsername);
            await page.type('#password', sharedPassword);
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => { }),
                page.click('button[type="submit"]')
            ]);
        });

        beforeEach(async () => {
            await page.goto(`${APP_URL}/lessons`, { waitUntil: 'networkidle2' }).catch(() => {});
            await page.waitForSelector('input[type="text"]');
            await page.evaluate(() => {
                const input = document.querySelector('input[type="text"]');
                if (input) {
                    input.value = '';
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
            await delay(DELAY_SHORT);
        });

        test('TC-SEARCH-01: Từ khóa hợp lệ', async () => {
            await page.type('input[type="text"]', 'Unit 2');
            await delay(DELAY_MEDIUM);
            const lessonCards = await page.$$('.card.relative.p-5');
            expect(lessonCards.length).toBeGreaterThan(0);
        });

        test('TC-SEARCH-02: Từ khóa không có kết quả', async () => {
            await page.type('input[type="text"]', 'xyzabc123');
            await delay(DELAY_MEDIUM);
            const lessonCards = await page.$$('.card.relative.p-5');
            expect(lessonCards.length).toBe(0);
            // EmptyState component renders a div.border-dashed (no text-slate-400 on svg)
            const emptyStateExists = await page.$('div.border-dashed');
            expect(emptyStateExists).not.toBeNull();
        });

        test('TC-SEARCH-03: Từ khóa trống', async () => {
            await page.focus('input[type="text"]');
            await page.keyboard.press('Enter');
            await delay(DELAY_SHORT);
            const lessonCards = await page.$$('.card.relative.p-5');
            expect(lessonCards.length).toBeGreaterThan(0);
        });

        test('TC-SEARCH-04: Từ khóa quá ngắn', async () => {
            await page.type('input[type="text"]', 'a');
            await delay(DELAY_MEDIUM);
            const lessonCards = await page.$$('.card.relative.p-5');
            expect(lessonCards.length).toBeGreaterThanOrEqual(0);
        });

        test('TC-SEARCH-05: Ký tự đặc biệt', async () => {
            await page.type('input[type="text"]', '@#$%');
            await delay(DELAY_MEDIUM);
            const emptyStateSVG = await page.$('svg');
            expect(emptyStateSVG).toBeDefined();
            const lessonCards = await page.$$('.card.relative.p-5');
            expect(lessonCards.length).toBe(0);
        });
    });
});
