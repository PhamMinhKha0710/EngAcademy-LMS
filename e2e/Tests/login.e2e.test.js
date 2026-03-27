const puppeteer = require('puppeteer');

const APP_URL = 'http://localhost:3000';
const { delay } = require('../Utils/helpers');

// Tránh lỗi Hook timeout (Mặc định Jest cho trước 5s, ta tăng lên 60s cho chắc chắn)
jest.setTimeout(60000);

describe('ĐANH SÁCH TEST CASE LĨNH VỰC ĐĂNG NHẬP', () => {
    let browser;
    let page;

    beforeAll(async () => {
        const fs = require('fs');
        if (!fs.existsSync('./e2e/Screenshots')) {
            fs.mkdirSync('./e2e/Screenshots', { recursive: true });
        }

        browser = await puppeteer.launch({
            headless: false, // Để bạn có thể nhìn thấy quá trình test
            slowMo: 30, // Chậm lại để dễ quan sát
            args: ['--window-size=1280,800']
        });
    });

    beforeEach(async () => {
        // Mỗi Test Case mở 1 tab mới, môi trường sạch
        page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        // GÀI THÊM BƯỚC NÀY: Do các tab (page) dùng chung 1 cửa sổ trình duyệt (browser)
        // Nên nếu Test số 1 đăng nhập thành công, Test số 2 sẽ bị dính trạng thái "Đã đăng nhập"
        // dẫn tới việc đi vào /login sẽ lập tức bị đá văng ra Dashboard (và gây lỗi không tìm thấy #username).
        await page.goto(APP_URL); // Tới trang chủ để lấy domain context
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });

        // Luồn bắt đầu từ trang Đăng nhập
        await page.goto(`${APP_URL}/login`);
        await page.waitForSelector('#username');
    });

    afterEach(async () => {
        if (page) {
            try {
                // Tạo tên file từ tên kịch bản test
                const testName = expect.getState().currentTestName.replace(/[^a-z0-9]/gi, '_');
                await page.screenshot({ path: `./e2e/Screenshots/${testName}.png`, fullPage: true });
            } catch (err) {}
            await page.close();
        }
    });

    afterAll(async () => {
        if (browser) await browser.close();
    });

    // 1. TC-LOGIN-01: Đăng nhập đúng thông tin
    test('TC-LOGIN-01: Đăng nhập thành công với tài khoản hợp lệ', async () => {
        const validUsername = 'hannie'; // Đổi lại thành TK thật trên DB của bạn
        const validPassword = 'bichhang18122004@gmail.com'; 

        await page.type('#username', validUsername);
        await page.type('#password', validPassword);

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {}),
            page.click('button[type="submit"]')
        ]);

        // Expected 1: Chuyển hướng về trang chủ/Dashboard
        const url = page.url();
        expect(url).not.toContain('/login');

        // Expected 2: Hiển thị tên người dùng ở góc phải (Header của Frontend)
        // Tìm element chứa tên (thẻ a có href='/settings')
        await page.waitForSelector('a[href="/settings"]');
        const userFullName = await page.$eval('a[href="/settings"]', el => el.textContent.trim());
        expect(userFullName.length).toBeGreaterThan(0);
        
        await delay(1000); 
    }, 20000);


    // 2. TC-LOGIN-02: Đăng nhập sai mật khẩu
    test('TC-LOGIN-02: Kiểm tra thông báo khi nhập sai mật khẩu', async () => {
        const validUsername = 'hannie';
        const invalidPassword = 'WrongPassword999'; 

        await page.type('#username', validUsername);
        await page.type('#password', invalidPassword);

        // Click Đăng nhập (Lần này API sẽ trả về lỗi, không có Navigation)
        await page.click('button[type="submit"]');

        // Expected 1: Không chuyển hướng (Vẫn ở /login)
        await delay(1500); // Chờ API trả lỗi
        expect(page.url()).toContain('/login');

        // Expected 2: Hiển thị thông báo lỗi "Sai tài khoản hoặc mật khẩu" (hoặc từ translation)
        // Trong Login.tsx, lỗi hiển thị ở thẻ Div error màu đỏ
        await page.waitForSelector('.bg-red-500\\/10.text-red-600');
        const errorText = await page.$eval('.bg-red-500\\/10.text-red-600', el => el.textContent.trim());
        
        // Bạn có thể tùy chỉnh Expect dưới đây cho đúng với Data API trả về
        expect(errorText.length).toBeGreaterThan(0); 
    }, 15000);


    // 3. TC-LOGIN-03: Đăng nhập thiếu username
    test('TC-LOGIN-03: Kiểm tra thông báo khi để trống username', async () => {
        // Chỉ nhập mật khẩu
        await page.type('#password', 'Password@123');

        // Click Đăng nhập
        await page.click('button[type="submit"]');

        // Expected: Dựa trên thuộc tính required của HTML5, tooltip sẽ chặn form
        const isUsernameInvalid = await page.$eval('#username', el => !el.checkValidity());
        expect(isUsernameInvalid).toBe(true);

        // Đọc thông báo lỗi native của trình duyệt (Ví dụ: "Please fill out this field")
        const validationMessage = await page.$eval('#username', el => el.validationMessage);
        expect(validationMessage).not.toBe('');
        
    }, 10000);


    // 4. TC-LOGIN-04: Đăng nhập thiếu password
    test('TC-LOGIN-04: Kiểm tra thông báo khi để trống password', async () => {
        // Chỉ nhập username
        await page.type('#username', 'testuser123');

        // Click Đăng nhập
        await page.click('button[type="submit"]');

        // Expected: Trình duyệt sẽ chặn gửi đi vì thuộc tính `required` của input password
        const isPasswordInvalid = await page.$eval('#password', el => !el.checkValidity());
        expect(isPasswordInvalid).toBe(true);

        // Đọc thông báo lỗi native
        const validationMessage = await page.$eval('#password', el => el.validationMessage);
        expect(validationMessage).not.toBe('');

    }, 10000);


    // 5. TC-LOGIN-05: Kiểm tra bảo mật mật khẩu
    test('TC-LOGIN-05: Kiểm tra trường mật khẩu có được che dấu', async () => {
        // Chọn ô Password và nhập nội dung
        await page.type('#password', 'SecretPassword');

        // Expected 1: Thuộc tính mặc định của thẻ input password phải là type="password"
        const inputType = await page.$eval('#password', el => el.type);
        expect(inputType).toBe('password');

        // Mở rộng kịch bản: Kiểm tra tính năng "Hiển thị mật khẩu" (từ icon con mắt)
        // Click vào nút bật xem mật khẩu (thẻ button chứa icon EyeOff/Eye)
        // Trong React Login.tsx của bạn có nút button để Show/Hide password ngay sau ô input
        const toggleButtons = await page.$$('button[type="button"]');
        // Nút toggle là nút type=button đầu tiên trong cụm password
        if(toggleButtons.length > 0) {
            await toggleButtons[0].click(); // Click để hiện
            const inputTypeAfterClick = await page.$eval('#password', el => el.type);
            expect(inputTypeAfterClick).toBe('text'); // Password đã hiển thị kí tự thật
        }

    }, 10000);
});
