const puppeteer = require("puppeteer");
const { delay } = require("../Utils/helpers");
const { getLatestOTP } = require("../Utils/mailHelper");
const fs = require("fs");
const path = require("path");

jest.setTimeout(90000);
const APP_URL = "http://localhost:3000";

const DELAY_SHORT = 500;
const DELAY_MEDIUM = 1000;
const DELAY_LONG = 1500;
const DELAY_BETWEEN_TESTS = 1200;

/**
 * Helper: Nhập văn bản vào các trường React controlled (email, password...).
 * Sử dụng native setter và dispatch event để bypass React's virtual DOM sync.
 */
async function typeReactInput(elementHandle, text) {
  if (!elementHandle) throw new Error("Element handle is null");
  await elementHandle.click();
  await elementHandle.evaluate((el, val) => {
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    ).set;
    nativeSetter.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, text);
}

const typePassword = (_page, el, text) => typeReactInput(el, text);

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
        username: "lamlyhao453@gmail.com",
        password: "lyhao1704",
      }
    }
  };
}

describe("KIỂM THỬ CHỨC NĂNG QUÊN MẬT KHẨU (FORGOT PASSWORD E2E)", () => {
  let browser;
  let page;
  let testData;

  beforeAll(async () => {
    console.log("🚀 Bắt đầu bộ test chức năng Quên mật khẩu...");
    testData = loadTestData();
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 50,
      args: ["--window-size=1280,800"],
    });
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
      await page.goto(APP_URL, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        // Ép ngôn ngữ tiếng Việt để kiểm tra text nếu cần, nhưng test này dùng selector kỹ thuật
        localStorage.setItem('i18nextLng', 'vi');
        document.cookie.split(";").forEach((c) => {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      });
      await page.goto(`${APP_URL}/forgot-password`, { waitUntil: "networkidle2" });
      await page.waitForSelector('input[type="email"]');
    } catch (err) {
      console.error("❌ Lỗi khởi tạo trang:", err.message);
      throw err;
    }
  });

  afterEach(async () => {
    const fullName = expect.getState().currentTestName;
    const testId = fullName.substring(0, 5);
    const status = expect.getState().assertionCalls === expect.getState().numPassingAsserts ? "PASSED" : "FAILED";

    if (page && !page.isClosed()) {
      await page.screenshot({ path: `./e2e/Screenshots/${testId}_${status.toLowerCase()}.png`, fullPage: true });
      await page.close();
    }
    await delay(DELAY_BETWEEN_TESTS);
  });

  afterAll(async () => {
    if (browser) await browser.close();
    console.log("🏁 Hoàn tất bộ test.");
  });

  // HELPER CHUYỂN BƯỚC
  async function goToStep2(page, email) {
    const emailInput = await page.$('input[type="email"]');
    await typeReactInput(emailInput, email);
    await page.click('button[type="submit"]');
    // Đợi cho đến khi xuất hiện ô nhập mật khẩu (dấu hiệu của Step 2)
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await delay(DELAY_MEDIUM); // Chờ React render xong hoàn toàn
  }

  // ---------- BƯỚC 1: NHẬP EMAIL ----------

  test("QMK01: Gửi email hợp lệ để đặt lại mật khẩu", async () => {
    const { username } = testData.login.validUser;
    console.log(`📧 QMK01: Nhập email: ${username}`);
    await goToStep2(page, username);
    expect(page.url()).toContain("/forgot-password");
    console.log("✅ Chuyển sang Bước 2 thành công.");
  });

  test("QMK02: Email chưa đăng ký vẫn được gửi OTP (Bảo mật)", async () => {
    const email = "notexist@gmail.com";
    console.log(`📧 QMK02: Nhập email chưa đăng ký: ${email}`);
    await goToStep2(page, email);
    // Theo feedback: Web cho phép chuyển bước dù email chưa đăng ký
    const passInputs = await page.$$('input[type="password"]');
    expect(passInputs.length).toBeGreaterThan(0);
    console.log("✅ Hệ thống cho phép chuyển sang bước mật khẩu (bảo mật email).");
  });

  test("QMK03: Bỏ trống email", async () => {
    console.log("⚠️ QMK03:Để trống email...");
    await page.click('button[type="submit"]');
    const isInvalid = await page.$eval('input[type="email"]', (el) => !el.checkValidity());
    expect(isInvalid).toBe(true);
  });

  test("QMK04: Email sai format", async () => {
    const email = "invalid-email-format"; // Chắc chắn sai (thiếu @)
    console.log(`📧 [QMK04] Thử nghiệm với email sai định dạng: ${email}`);
    const emailInput = await page.$('input[type="email"]');
    await typeReactInput(emailInput, email);
    await page.click('button[type="submit"]');
    await delay(300);

    // Kiểm tra tính hợp lệ của input ngay tại trang hiện tại
    const isInvalid = await page.$eval('input[type="email"]', (el) => !el.checkValidity());
    expect(isInvalid).toBe(true);
    console.log("✅ [QMK04] Đã xác nhận trình duyệt chặn email sai format.");
  });

  test("QMK05: Khoảng trắng email", async () => {
    const { username } = testData.login.validUser;
    console.log(`📧 [QMK05] Nhập email có khoảng trắng: " ${username} "`);
    await goToStep2(page, `  ${username}  `);
    expect(page.url()).toContain("/forgot-password");
    console.log("✅ Trim email thành công.");
  });

  test("QMK06: Email IN HOA", async () => {
    const { username } = testData.login.validUser;
    console.log(`📧 [QMK06] Nhập email IN HOA: ${username.toUpperCase()}`);
    await goToStep2(page, username.toUpperCase());
    expect(page.url()).toContain("/forgot-password");
    console.log("✅ Nhận diện email IN HOA thành công.");
  });

  // ---------- BƯỚC 2: ĐẶT MẬT KHẨU MỚI ----------

  test("QMK07: Đặt mật khẩu hợp lệ (≥6 ký tự)", async () => {
    const { username } = testData.login.validUser;
    await goToStep2(page, username);

    console.log("🔒 [QMK07] Bước 2: Nhập mật khẩu mới...");
    const passInputs = await page.$$('input[type="password"]');
    expect(passInputs.length).toBeGreaterThanOrEqual(2);

    await typePassword(page, passInputs[0], "Abc@123456"); // Mật khẩu mới
    await typePassword(page, passInputs[1], "Abc@123456"); // Xác nhận

    console.log("🖱️ Bấm nút Đổi mật khẩu...");
    await page.click('button[type="submit"]');

    console.log("⏳ Chờ Step 3 (Nhập OTP)...");
    await page.waitForSelector('input[inputmode="numeric"]', { timeout: 15000 });
    console.log("✅ Đã tới bước OTP thành công.");
  });

  test("QMK08: Mật khẩu quá ngắn (<6 ký tự)", async () => {
    const { username } = testData.login.validUser;
    console.log(`🔒 [QMK08] Nhập email: ${username} để vào Step 2...`);
    await goToStep2(page, username);

    console.log("⌨️ [QMK08] Nhập mật khẩu quá ngắn: '123'");
    const passInputs = await page.$$('input[type="password"]');
    await typePassword(page, passInputs[0], "123");
    await typePassword(page, passInputs[1], "123");
    await page.click('button[type="submit"]');

    await page.waitForSelector(".bg-red-500\\/10");
    const error = await page.$eval(".bg-red-500\\/10", (el) => el.innerText);
    expect(error.length).toBeGreaterThan(0);
    console.log("✅ [QMK08] Đã hiển thị lỗi mật khẩu ngắn.");
  });

  test("QMK09: Mật khẩu không khớp", async () => {
    const { username } = testData.login.validUser;
    console.log(`🔒 [QMK09] Nhập email: ${username} để vào Step 2...`);
    await goToStep2(page, username);

    console.log("⌨️ [QMK09] Nhập mật khẩu không khớp: 'Abc@123456' và 'Diff@123456'");
    const passInputs = await page.$$('input[type="password"]');
    await typePassword(page, passInputs[0], "Abc@123456");
    await typePassword(page, passInputs[1], "Diff@123456");
    await page.click('button[type="submit"]');

    await page.waitForSelector(".bg-red-500\\/10");
    const error = await page.$eval(".bg-red-500\\/10", (el) => el.innerText);
    expect(error).toContain("khớp");
    console.log("✅ [QMK09] Đã hiển thị lỗi không khớp.");
  });

  test("QMK10: Mật khẩu mới trùng mật khẩu cũ", async () => {
    const { username, password } = testData.login.validUser;
    console.log(`🔒 [QMK10] Nhập email: ${username} để vào Step 2...`);
    await goToStep2(page, username);

    console.log(`⌨️ [QMK10] Nhập mật khẩu trùng cũ: ${password}`);
    const passInputs = await page.$$('input[type="password"]');
    await typePassword(page, passInputs[0], password);
    await typePassword(page, passInputs[1], password);
    await page.click('button[type="submit"]');

    await page.waitForSelector(".bg-red-500\\/10"); // Đợi thông báo lỗi từ server
    const error = await page.$eval(".bg-red-500\\/10", (el) => el.innerText);
    expect(error.length).toBeGreaterThan(0);
    console.log("✅ [QMK10] Đã kiểm tra lỗi mật khẩu trùng cũ.");
  });

});
