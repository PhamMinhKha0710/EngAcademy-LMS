const puppeteer = require("puppeteer");
const { delay } = require("../Utils/helpers");
const fs = require("fs");
const path = require("path");

jest.setTimeout(90000);
const APP_URL = "http://localhost:3000";

const DELAY_SHORT = 500;
const DELAY_MEDIUM = 1000;
const DELAY_LONG = 1500;
const DELAY_BETWEEN_TESTS = 1200;

// ---------- ĐỌC DỮ LIỆU TỪ JSON ----------
function loadTestData() {
  const dataPath = path.join(__dirname, "TestData", "test_data.json");
  if (fs.existsSync(dataPath)) {
    try {
      const raw = fs.readFileSync(dataPath, "utf8");
      return JSON.parse(raw);
    } catch (err) {
      console.warn("⚠️ [WARN] Không đọc được file test_data.json:", err.message);
    }
  }
  return {
    login: {
      validUser: {
        username: "dinhminh4424@gmail.com",
        password: "dinhminh4424@gmail.com",
      }
    }
  };
}

describe("KIỂM THỬ CHỨC NĂNG ĐĂNG NHẬP (LOGIN E2E)", () => {
  let page;
  let testData;
  let testStartTime;

  beforeAll(async () => {
    const screenshotDir = path.join(__dirname, "Screenshots");
    if (!fs.existsSync(screenshotDir))
      fs.mkdirSync(screenshotDir, { recursive: true });
    testData = loadTestData();
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 50, // Giảm slowMo để nhanh hơn nhưng vẫn ổn định
      args: ["--window-size=1280,800"],
    });
  });

  beforeEach(async () => {
    testStartTime = Date.now();
    // Tạo page mới cho mỗi test
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Dọn dẹp trạng thái triệt để (Mirroring register.e2e.test.js strategy)
    try {
        await page.goto(APP_URL, { waitUntil: "domcontentloaded" });
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
            document.cookie.split(";").forEach((c) => {
                document.cookie = c
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
        });
        
        await page.goto(`${APP_URL}/login`, { waitUntil: "networkidle2", timeout: 60000 });
        await page.waitForSelector("#username", { timeout: 15000 });
    } catch (err) {
        console.warn("⚠️ [WARN] Lỗi khởi tạo test:", err.message);
        throw err;
    }
  });

  afterEach(async () => {
    const fullName = expect.getState().currentTestName;
    const idMatch = fullName.match(/\b(TC-LOGIN-\d{2})\b/);
    const testId = idMatch ? idMatch[0] : "TC-LOGIN-UNKNOWN";
    
    // Xác định trạng thái để lưu ảnh đúng tên cho Reporter
    const state = expect.getState();
    const isPassed = state.assertionCalls === state.numPassingAsserts;
    const suffix = isPassed ? "_passed" : "_failed";

    if (page && !page.isClosed()) {
      try {
        await page.screenshot({
          path: `./e2e/Screenshots/${testId}${suffix}.png`,
          fullPage: true,
        });
      } catch (err) {
        console.log("⚠️ [Warning] Không thể chụp màn hình:", err.message);
      }
      // Đóng page sau mỗi test
      try {
        await page.close();
      } catch (e) {}
    }
    await delay(DELAY_BETWEEN_TESTS);
  });

  afterAll(async () => {
    if (browser) await browser.close();
  });

  test("TC-LOGIN-01: Đăng nhập thành công | Nhập đúng tài khoản -> Dashboard -> Logout", async () => {
    const { username, password } = testData.login.validUser;
    await page.type("#username", username);
    await page.type("#password", password);

    // Kiểm tra tính năng hiển thị mật khẩu
    const toggleBtn = await page.waitForSelector("#password + button");
    await toggleBtn.click();
    expect(await page.$eval("#password", (el) => el.type)).toBe("text");
    await toggleBtn.click();
    expect(await page.$eval("#password", (el) => el.type)).toBe("password");

    await Promise.all([
      page
        .waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 })
        .catch(() => {}),
      page.click('button[type="submit"]'),
    ]);

    // Kiểm tra đã vào Dashboard
    expect(page.url()).not.toContain("/login");
    await page.waitForSelector('a[href="/settings"]');

    // ĐĂNG XUẤT ĐỂ KẾT THÚC PHIÊN (Theo yêu cầu người dùng)
    const logoutBtn = await page.waitForSelector("#logoutButton");
    await logoutBtn.click();

    // Đợi chuyển hướng về trang chủ (/) thay vì chờ #username vì trang chủ có thể không có form login ngay
    await page.waitForFunction(() => window.location.pathname === "/", {
      timeout: 10000,
    });
    await delay(DELAY_SHORT); // Đợi yên ổn sau khi logout
  });


  test("TC-LOGIN-02: Đăng nhập thất bại - Sai mật khẩu | Nhập đúng Email nhưng sai mật khẩu -> Hiển thị lỗi", async () => {
    const { username } = testData.login.validUser;
    await page.type("#username", username);
    await page.type("#password", "WrongPassword999!");

    // Kiểm tra tính năng hiển thị mật khẩu
    const toggleBtn = await page.waitForSelector("#password + button");
    await toggleBtn.click();
    expect(await page.$eval("#password", (el) => el.type)).toBe("text");
    await toggleBtn.click();

    await page.click('button[type="submit"]');
    await delay(DELAY_MEDIUM);
    expect(page.url()).toContain("/login");
    await page.waitForSelector(".bg-red-500\\/10.text-red-600");
  });

  test("TC-LOGIN-03: Đăng nhập thất bại - Tài khoản không tồn tại | Nhập tài khoản chưa có trong hệ thống -> Lỗi", async () => {
    await page.type("#username", "nonexistent_user_xyz@gmail.com");
    await page.type("#password", "SomePassword123!");

    // Kiểm tra tính năng hiển thị mật khẩu
    const toggleBtn = await page.waitForSelector("#password + button");
    await toggleBtn.click();
    expect(await page.$eval("#password", (el) => el.type)).toBe("text");
    await toggleBtn.click();

    await page.click('button[type="submit"]');
    await delay(DELAY_MEDIUM);
    expect(page.url()).toContain("/login");
    await page.waitForSelector(".bg-red-500\\/10.text-red-600");
  });


  test("TC-LOGIN-04: Nhập thiếu trường Tên đăng nhập | Để trống Username -> Validation thông báo thiếu", async () => {
    await page.type("#password", "anything123");
    await page.click('button[type="submit"]');
    const isInvalid = await page.$eval("#username", (el) => !el.checkValidity());
    expect(isInvalid).toBe(true);
  });

  test("TC-LOGIN-05: Nhập thiếu trường Mật khẩu | Để trống Password -> Validation thông báo thiếu", async () => {
    await page.type("#username", "dinhminh4424@gmail.com");
    await page.click('button[type="submit"]');
    const isInvalid = await page.$eval("#password", (el) => !el.checkValidity());
    expect(isInvalid).toBe(true);
  });

  test("TC-LOGIN-06: Để trống cả hai trường và nhấn đăng nhập | Để trống toàn bộ form -> Validation yêu cầu nhập", async () => {
    await page.click('button[type="submit"]');
    const usernameInvalid = await page.$eval("#username", (el) => !el.checkValidity());
    const passwordInvalid = await page.$eval("#password", (el) => !el.checkValidity());
    expect(usernameInvalid || passwordInvalid).toBe(true);
  });

});
