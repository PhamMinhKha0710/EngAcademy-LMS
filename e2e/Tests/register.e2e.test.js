const puppeteer = require("puppeteer");
const { delay } = require("../Utils/helpers");
const fs = require("fs");
const path = require("path");

jest.setTimeout(90000);
const APP_URL = "http://localhost:3000";

const DELAY_SHORT = 500;
const DELAY_MEDIUM = 1000;
const DELAY_BETWEEN_TESTS = 1200;

describe("KỊCH BẢN KIỂM THỬ ĐĂNG KÝ (REGISTER E2E)", () => {
    let browser;
    let page;

    let testStartTime;
    let currentTestId = "";

    // Helper cực mạnh để update React state
    const setReactValue = async (selector, value) => {
        await page.waitForSelector(selector);
        await page.evaluate((sel, val) => {
            const input = document.querySelector(sel);
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(input, val);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }, selector, value);
    };

    beforeAll(async () => {
        const screenshotDir = path.join(__dirname, "Screenshots");
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }

        browser = await puppeteer.launch({
            headless: false,
            slowMo: 30, // Giảm slowMo một chút để nhanh hơn nhưng vẫn ổn định
            args: ["--window-size=1280,1000", "--lang=vi-VN"],
        });
    });

    beforeEach(async () => {
        testStartTime = Date.now();
        const fullName = expect.getState().currentTestName;
        const idMatch = fullName.match(/\b(TC-REG-\d{2})\b/);
        currentTestId = idMatch ? idMatch[0] : "TC-REG-UNKNOWN";
        
        console.log(`\n--- [${currentTestId}] Bắt đầu test case: ${fullName} ---`);

        // Tạo page mới cho mỗi test để đảm bảo isolation hoàn toàn
        page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 1000 });
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'vi-VN,vi;q=0.9' });

        // Reset state & Navigate
        try {
            // Đi tới trang chủ trước để có đúng origin và xóa sạch storage
            // Tránh việc bị redirect thẳng sang Dashboard nếu test trước đó đã login thành công
            await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
            await page.evaluate(() => {
                localStorage.clear();
                sessionStorage.clear();
                // Xóa cookie nếu cần (tùy thuộc vào cách auth được quản lý)
                document.cookie.split(";").forEach(function(c) { 
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                });
            });

            console.log(`[${currentTestId}] Điều hướng tới ${APP_URL}/register...`);
            await page.goto(APP_URL + '/register', { waitUntil: 'networkidle2', timeout: 60000 });
            
            // Reload một lần nữa cho chắc chắn React state sạch
            await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
            
            // Chờ form hiển thị gắt gao hơn
            await page.waitForSelector('#fullName', { timeout: 30000 });
            console.log(`[${currentTestId}] ✅ Sẵn sàng thử nghiệm.`);
        } catch (err) {
            console.log(`[${currentTestId}] ❌ Lỗi khởi tạo test: ${err.message}`);
            // In URL hiện tại để debug
            console.log(`[${currentTestId}] URL hiện tại: ${page.url()}`);
            throw err;
        }
    });

    afterEach(async () => {
        if (page) {
            try {
                const status = expect.getState().assertionCalls === expect.getState().numPassingAsserts ? 'passed' : 'failed';
                const suffix = status === 'passed' ? '_passed' : '_failed';
                
                await page.screenshot({
                    path: `./e2e/Screenshots/${currentTestId}${suffix}.png`,
                    fullPage: true,
                });
            } catch (err) {
                console.log("⚠️ [Warning] Không thể chụp màn hình:", err.message);
            }
            await page.close(); // Đóng page sau mỗi test
        }
        await delay(DELAY_BETWEEN_TESTS);
    });

    afterAll(async () => {
        if (browser) await browser.close();
    });

    test('TC-REG-01: Đăng ký thành công (Full Flow) | Nhập thông tin -> Chọn Avatar -> Màn hình Chào mừng', async () => {
        const dynamicUser = `user_${Date.now()}`;
        const dynamicEmail = `test_${Date.now()}@example.com`;
        const currentTestId = 'TC-REG-01';

        console.log(`[${currentTestId}] Bắt đầu Step 1: Nhập thông tin tài khoản...`);
        await setReactValue('#fullName', "Người Dùng Thử");
        await setReactValue('#username', dynamicUser);
        await setReactValue('#email', dynamicEmail);
        await setReactValue('#password', "Password123");
        await setReactValue('#confirmPassword', "Password123");
        
        console.log(`[${currentTestId}] Click Next Step...`);
        await page.click('#nextStep');
        await delay(DELAY_MEDIUM);

        // Step 2: Avatar
        console.log(`[${currentTestId}] Chờ Step 2: Chọn Avatar...`);
        await page.waitForSelector('h1', { timeout: 5000 });
        const step2Title = await page.$eval('h1', el => el.textContent);
        const expectedStep2 = ["Chọn bạn đồng hành", "Choose your buddy", "Choose your companion"];
        const matchStep2 = expectedStep2.some(text => step2Title.includes(text));
        expect(matchStep2).toBe(true);
        console.log(`[${currentTestId}] Đã tới trang chọn Avatar (${step2Title}).`);

        // Click Finish
        console.log(`[${currentTestId}] Click Hoàn thành đăng ký...`);
        const finishButton = await page.waitForSelector('#finishSignUp');
        await finishButton.click();
        await delay(DELAY_MEDIUM);

        // Step 3: Welcome
        console.log(`[${currentTestId}] Chờ Step 3: Màn hình chào mừng...`);
        await page.waitForSelector('#getStarted', { timeout: 10000 });
        const welcomeText = await page.$eval('h1', el => el.textContent);
        const expectedWelcome = ["Chào mừng", "Welcome"];
        const matchWelcome = expectedWelcome.some(text => welcomeText.includes(text));
        expect(matchWelcome).toBe(true);
        console.log(`[${currentTestId}] Đăng ký thành công! (${welcomeText})`);
        
        // TIẾN HÀNH ĐĂNG NHẬP (Click Get Started/Bắt đầu ngay)
        console.log(`[${currentTestId}] Click 'Bắt đầu ngay' để vào Dashboard...`);
        await page.click('#getStarted');
        
        // Đợi chuyển hướng tới Dashboard
        console.log(`[${currentTestId}] Chờ điều hướng tới Dashboard...`);
        await page.waitForFunction(() => window.location.pathname.includes('/dashboard'), { timeout: 15000 });
        console.log(`[${currentTestId}] ✅ Đã vào Dashboard thành công.`);

        // Logout ra để dọn dẹp session (theo yêu cầu user)
        console.log(`[${currentTestId}] Đang thực hiện Logout từ Dashboard...`);
        const logoutBtn = await page.waitForSelector('#logoutButton', { timeout: 10000 });
        await logoutBtn.click();
        await delay(3000); // Đợi web chuyển trang và xóa storage

        // Chờ cho đến khi token biến mất (retry tối đa 5s)
        console.log(`[${currentTestId}] Chờ session xóa sạch...`);
        let isLoggedOut = false;
        for (let i = 0; i < 10; i++) {
            isLoggedOut = await page.evaluate(() => {
                const storage = localStorage.getItem('auth-storage');
                if (!storage) return true;
                try {
                    const parsed = JSON.parse(storage);
                    // Kiểm tra cả isAuthenticated và accessToken trong state
                    return parsed.state.isAuthenticated === false && !parsed.state.accessToken;
                } catch (e) {
                    return true;
                }
            });
            if (isLoggedOut) break;
            await delay(500);
        }

        console.log(`[${currentTestId}] Trạng thái sau Logout: ${isLoggedOut ? 'Đã đăng xuất' : 'Vẫn còn login'}`);
        expect(isLoggedOut).toBe(true);
    });

    test('TC-REG-02: Lỗi thiếu Họ và tên | Để trống Họ tên -> Click Bước tiếp theo', async () => {
        const currentTestId = 'TC-REG-02';
        console.log(`[${currentTestId}] Kiểm tra lỗi trống Họ và tên...`);
        await page.click('#nextStep');
        await delay(DELAY_SHORT);
        
        const errorText = await page.$eval('#validationError', el => el.textContent.trim());
        console.log(`[${currentTestId}] Kết quả lỗi: ${errorText}`);
        const expectedErrors = ["Vui lòng nhập họ và tên", "Please enter your full name", "Họ và tên là bắt buộc"];
        const matchError = expectedErrors.some(text => errorText.includes(text));
        expect(matchError).toBe(true);
    });

    test('TC-REG-03: Lỗi thiếu Tên đăng nhập | Điền Họ tên -> Để trống Username -> Click Tiếp theo', async () => {
        const currentTestId = 'TC-REG-03';
        console.log(`[${currentTestId}] Kiểm tra lỗi trống Tên đăng nhập...`);
        await setReactValue('#fullName', "Test Name");
        await page.click('#nextStep');
        await delay(DELAY_SHORT);
        
        const errorText = await page.$eval('#validationError', el => el.textContent.trim());
        console.log(`[${currentTestId}] Kết quả lỗi: ${errorText}`);
        const expectedErrors = ["Vui lòng nhập tên đăng nhập", "Please enter your username", "Tên đăng nhập là bắt buộc"];
        const matchError = expectedErrors.some(text => errorText.includes(text));
        expect(matchError).toBe(true);
    });

    test('TC-REG-04: Lỗi thiếu Email | Điền Họ tên, User -> Để trống Email -> Click Tiếp theo', async () => {
        const currentTestId = 'TC-REG-04';
        console.log(`[${currentTestId}] Kiểm tra lỗi trống Email...`);
        await setReactValue('#fullName', "Test Name");
        await setReactValue('#username', "testuser");
        await page.click('#nextStep');
        await delay(DELAY_SHORT);
        
        const errorText = await page.$eval('#validationError', el => el.textContent.trim());
        console.log(`[${currentTestId}] Kết quả lỗi: ${errorText}`);
        const expectedErrors = ["Vui lòng nhập email", "Please enter your email", "Email là bắt buộc"];
        const matchError = expectedErrors.some(text => errorText.includes(text));
        expect(matchError).toBe(true);
    });

    test('TC-REG-05: Lỗi định dạng Email không hợp lệ | Nhập email không có @ -> Click Tiếp theo', async () => {
        const currentTestId = 'TC-REG-05';
        console.log(`[${currentTestId}] Kiểm tra lỗi Email không hợp lệ...`);
        await setReactValue('#fullName', "Test Name");
        await setReactValue('#username', "testuser");
        await setReactValue('#email', "invalid-email");
        await page.click('#nextStep');
        await delay(DELAY_SHORT);
        
        const errorText = await page.$eval('#validationError', el => el.textContent.trim());
        console.log(`[${currentTestId}] Kết quả lỗi: ${errorText}`);
        const expectedErrors = ["Email không hợp lệ", "Invalid email", "Email sai định dạng"];
        const matchError = expectedErrors.some(text => errorText.includes(text));
        expect(matchError).toBe(true);
    });

    test('TC-REG-06: Lỗi mật khẩu quá ngắn | Nhập pass < 6 ký tự -> Click Tiếp theo', async () => {
        const currentTestId = 'TC-REG-06';
        console.log(`[${currentTestId}] Kiểm tra lỗi mật khẩu ngắn...`);
        await setReactValue('#fullName', "Test Name");
        await setReactValue('#username', "testuser");
        await setReactValue('#email', "test@example.com");
        await setReactValue('#password', "123");
        await page.click('#nextStep');
        await delay(DELAY_SHORT);
        
        const errorText = await page.$eval('#validationError', el => el.textContent.trim());
        console.log(`[${currentTestId}] Kết quả lỗi: ${errorText}`);
        const expectedErrors = ["ít nhất 6 ký tự", "at least 6 characters"];
        const matchError = expectedErrors.some(text => errorText.includes(text));
        expect(matchError).toBe(true);
    });

    test('TC-REG-07: Lỗi mật khẩu xác nhận không khớp | Nhập confirm pass khác pass -> Click Tiếp theo', async () => {
        const currentTestId = 'TC-REG-07';
        console.log(`[${currentTestId}] Kiểm tra lỗi xác nhận mật khẩu không khớp...`);
        await setReactValue('#fullName', "Test Name");
        await setReactValue('#username', "testuser");
        await setReactValue('#email', "test@example.com");
        await setReactValue('#password', "Password123");
        await setReactValue('#confirmPassword', "Mismatch123");
        await page.click('#nextStep');
        await delay(DELAY_SHORT);
        
        const errorText = await page.$eval('#validationError', el => el.textContent.trim());
        console.log(`[${currentTestId}] Kết quả lỗi: ${errorText}`);
        const expectedErrors = ["không khớp", "mismatch", "không giống nhau"];
        const matchError = expectedErrors.some(text => errorText.includes(text));
        expect(matchError).toBe(true);
    });
});
