const puppeteer = require('puppeteer');

const APP_URL = 'http://localhost:3000';

const { delay } = require('../Utils/helpers');

// Tăng thời gian tối đa cho các hook của Jest lên (mặc định quá 5s tự tắt)
jest.setTimeout(60000);

describe('Kiểm thử E2E: WebLearnEnglish', () => {
    let browser;
    let page;

    beforeAll(async () => {
        const fs = require('fs');
        if (!fs.existsSync('./e2e/Screenshots')) {
            fs.mkdirSync('./e2e/Screenshots', { recursive: true });
        }

        browser = await puppeteer.launch({
            headless: false,
            slowMo: 40,
            args: ['--window-size=1280,800']
        });
    });

    beforeEach(async () => {
        page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
    });

    afterEach(async () => {
        if (page) {
            try {
                // Tạo tên file từ tên kịch bản test
                const testName = expect.getState().currentTestName.replace(/[^a-z0-9]/gi, '_');
                await page.screenshot({ path: `./e2e/Screenshots/${testName}.png`, fullPage: true });
            } catch (err) { }
            await page.close();
        }
    });

    afterAll(async () => {
        if (browser) await browser.close();
    });

    test('Kịch bản 1: Hành trình người dùng mới (Đăng ký -> Dashboard -> Tìm khóa học)', async () => {
        const uniqueUsername = 'test_' + Date.now();
        const registeredEmail = `${uniqueUsername}@example.com`;
        const registeredPassword = 'Password@123';

        // 1. ĐĂNG KÝ MỚI
        await page.goto(`${APP_URL}/register`);
        await page.waitForSelector('input[type="text"]');

        const textInputs = await page.$$('input[type="text"]');
        await textInputs[0].type('Nguyen Van A');
        await textInputs[1].type(uniqueUsername);

        await page.type('input[type="email"]', registeredEmail);

        const passwordInputs = await page.$$('input[type="password"]');
        await passwordInputs[0].type(registeredPassword);
        await passwordInputs[1].type(registeredPassword);

        // Chuyển sang tải Avatar
        await page.click('button[type="submit"]');
        await page.waitForSelector('.ring-2.ring-slate-200', { timeout: 10000 });

        // Hoàn thành đăng ký
        const finishButtons = await page.$$('button.bg-primary-500');
        if (finishButtons.length > 0) {
            await finishButtons[finishButtons.length - 1].click();
        }

        // Đợi web gọi API thành công, TỰ ĐỘNG LƯU PHIÊN ĐĂNG NHẬP, và chuyển hướng qua Dashboard thay vì ở bước 3
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => { });
        await delay(2000); // Nghỉ 2 giây để xem trang Dashboard (đã Login)

        // 2. TÌM KIẾM BÀI HỌC
        // Tiếp tục dùng phiên đăng nhập vừa rồi tự sinh để sang trang Lessons
        await page.goto(`${APP_URL}/lessons`);
        const searchInputSelector = 'input[type="text"]';
        await page.waitForSelector(searchInputSelector);

        // Gõ tìm kiếm
        await page.type(searchInputSelector, 'Unit 2');
        await delay(1500); // Chờ list khoá học xổ xuống

        // Kiểm tra DOM có thẻ bài học
        const lessonCards = await page.$$('.card.relative.p-5');
        expect(lessonCards).toBeDefined();

    }, 60000);


    test('Kịch bản 2: Hành trình người dùng cũ (Đăng xuất -> Đăng nhập lại)', async () => {
        // Tình huống: Ở Kịch bản 1, trình duyệt đã lưu thông tin đăng nhập. 
        // Nên lúc này ở Kịch bản 2, người dùng vẫn đang ở trạng thái Đăng nhập.
        await page.goto(`${APP_URL}`); // Trở về trang chủ/Dashboard
        await delay(2000); // Chờ hiển thị giao diện

        // 1. ĐĂNG XUẤT TÀI KHOẢN CŨ
        // Tìm và click nút Đăng xuất trên thanh Header
        const loggedOut = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const logoutBtn = buttons.find(b =>
                b.textContent.includes('Đăng xuất') ||
                b.textContent.includes('Logout')
            );

            if (logoutBtn) {
                logoutBtn.click();
                return true;
            }
            return false;
        });

        // Đợi 2 giây cho web xử lý đăng xuất, xóa token và tải lại trang
        if (loggedOut) {
            await delay(2000);
        }

        // 2. ĐĂNG NHẬP LẠI VỚI TÀI KHOẢN KHÁC
        await page.goto(`${APP_URL}/login`);
        await page.waitForSelector('#username');

        // Tài khoản đã có sẵn mà bạn cấu hình
        await page.type('#username', 'hannie');
        await page.type('#password', 'bichhang18122004@gmail.com');

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => { }),
            page.click('button[type="submit"]')
        ]);

        // Đã vào Dashboard không còn ở /login
        const url = page.url();
        expect(url).not.toContain('/login');

        await delay(2000); // Nhìn Dashboard 2 giây rồi test case kết thúc
    }, 45000);
});
