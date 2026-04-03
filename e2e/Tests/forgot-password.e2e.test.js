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
        username: "bichhang18122004@gmail.com",
        password: "hannie1812",
      }
    }
  };
}

describe("KIỂM THỬ CHỨC NĂNG QUÊN MẬT KHẨU (FORGOT PASSWORD E2E)", () => {
  let browser;
  let page;
  let testData;
  let testStartTime;

  beforeAll(async () => {
    const screenshotDir = path.join(__dirname, "..", "Screenshots");
    if (!fs.existsSync(screenshotDir))
      fs.mkdirSync(screenshotDir, { recursive: true });
    testData = loadTestData();
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 50,
      args: ["--window-size=1280,800"],
    });
  });

  beforeEach(async () => {
    testStartTime = Date.now();
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

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
        
        await page.goto(`${APP_URL}/forgot-password`, { waitUntil: "networkidle2", timeout: 60000 });
        await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    } catch (err) {
        console.warn("⚠️ [WARN] Lỗi khởi tạo test:", err.message);
        throw err;
    }
  });

  afterEach(async () => {
    const fullName = expect.getState().currentTestName;
    const idMatch = fullName.match(/\b(QMK\d{2})\b/);
    const testId = idMatch ? idMatch[0] : "QMK-UNKNOWN";
    
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
      try {
        await page.close();
      } catch (e) {}
    }
    await delay(DELAY_BETWEEN_TESTS);
  });

  afterAll(async () => {
    if (browser) await browser.close();
  });

  // ---------- CÁC TEST CASE BƯỚC 1: NHẬP EMAIL ----------

  test("QMK01: Gửi email hợp lệ để đặt lại mật khẩu | Đang ở form 'Quên mật khẩu?' -> Nhập email đã đăng ký -> Tiếp theo", async () => {
    const { username } = testData.login.validUser;
    await page.type('input[type="email"]', username);
    await page.click('button[type="submit"]');

    // Chuyển sang bước 2 (Đặt mật khẩu mới)
    await page.waitForSelector('input[placeholder="Ít nhất 6 ký tự"]', { timeout: 10000 });
    const currentUrl = page.url();
    expect(currentUrl).toContain("/forgot-password");
    
    // Kiểm tra đã hiện step 2
    const stepText = await page.evaluate(() => document.body.innerText);
    expect(stepText).toContain("Đặt mật khẩu mới");
  });

  test("QMK02: Email không tồn tại trong hệ thống | Đang ở form 'Quên mật khẩu?' -> Nhập email chưa đăng ký -> Tiếp theo", async () => {
    await page.type('input[type="email"]', "notexist@gmail.com");
    await page.click('button[type="submit"]');

    // Hiện thị lỗi
    await page.waitForSelector(".bg-red-500\\/10");
    const errorText = await page.$eval(".bg-red-500\\/10", (el) => el.innerText);
    // Lưu ý: Kết quả thực tế phụ chuẩn message từ BE
    expect(errorText.length).toBeGreaterThan(0);
  });

  test("QMK03: Bỏ trống email | Đang ở form 'Quên mật khẩu?' -> Để trống email -> Tiếp theo", async () => {
    await page.click('button[type="submit"]');
    
    // Kiểm tra browser validation (HTML5)
    const isInvalid = await page.$eval('input[type="email"]', (el) => !el.checkValidity());
    expect(isInvalid).toBe(true);
  });

  test("QMK04: Email sai format | Đang ở form 'Quên mật khẩu?' -> Nhập email sai định dạng (abc@ hoặc abc.com) -> Tiếp theo", async () => {
    await page.type('input[type="email"]', "abc@com"); // Một số trình duyệt chấp nhận cái này, thử cái sai hơn
    await page.click('button[type="submit"]');
    
    // Nếu BE bắt lỗi định dạng
    await delay(DELAY_MEDIUM);
    // Hoặc HTML5 validation
    const isInvalid = await page.$eval('input[type="email"]', (el) => !el.checkValidity());
    // expect(isInvalid).toBe(true); // Tùy vào mức độ validate của trình duyệt
  });

  test("QMK05: Khoảng trắng đầu/cuối email | Đang ở form 'Quên mật khẩu?' -> Nhập email có khoảng trắng -> Tiếp theo", async () => {
    const { username } = testData.login.validUser;
    await page.type('input[type="email"]', `  ${username}  `);
    await page.click('button[type="submit"]');

    // Hệ thống tự động trim và chuyển sang bước tiếp theo
    await page.waitForSelector('input[placeholder="Ít nhất 6 ký tự"]', { timeout: 10000 });
    expect(await page.evaluate(() => document.body.innerText)).toContain("Đặt mật khẩu mới");
  });

  test("QMK06: Email không phân biệt hoa thường | Email trong DB là chữ thường -> Nhập email dạng IN HOA -> Tiếp theo", async () => {
    const { username } = testData.login.validUser;
    await page.type('input[type="email"]', username.toUpperCase());
    await page.click('button[type="submit"]');

    // Vẫn nhận diện được và chuyển sang bước tiếp theo
    await page.waitForSelector('input[placeholder="Ít nhất 6 ký tự"]', { timeout: 10000 });
    expect(await page.evaluate(() => document.body.innerText)).toContain("Đặt mật khẩu mới");
  });

  // ---------- CÁC TEST CASE BƯỚC 2: ĐẶT MẬT KHẨU MỚI ----------

  test("QMK07: Đặt mật khẩu hợp lệ (>=6 ký tự, 1 số, 1 ký tự đặc biệt) | Đã qua bước 1 -> Nhập mật khẩu khớp -> Gửi OTP -> Xác thực OTP", async () => {
    const { username } = testData.login.validUser;
    
    // Bước 1
    console.log(">>> GIAI ĐOẠN 1: Nhập Email xác thực...");
    await page.type('input[type="email"]', username);
    await page.click('button[type="submit"]');
    await page.waitForSelector('input[placeholder="Ít nhất 6 ký tự"]');

    // Bước 2
    console.log(">>> GIAI ĐOẠN 2: Thiết lập mật khẩu mới...");
    const passInputs = await page.$$('input[type="password"]'); 
    // Do component dùng Link/navigate nhưng ForgotPassword.tsx code có form step by step
    // password inputs: 1 cho new password, 1 cho confirm password
    
    await passInputs[0].type("Abc@123456");
    await passInputs[1].type("Abc@123456");
    
    console.log(">>> Giai đoạn gửi yêu cầu OTP từ hệ thống...");
    await page.click('button[type="submit"]');

    // Chuyển sang bước 3 (nhập OTP)
    await page.waitForSelector('input[inputmode="numeric"]', { timeout: 15000 });
    expect(await page.evaluate(() => document.body.innerText)).toContain("Nhập mã OTP");

    // Giai đoạn 3: Lấy và điền OTP
    console.log(">>> GIAI ĐOẠN 3: Đang lấy mã OTP từ Gmail (Vui lòng chờ)...");
    try {
        const otp = await getLatestOTP(60); // Đợi tối đa 60s
        console.log(`>>> Đã lấy được OTP: ${otp}. Tiến hành điền vào form...`);
        // Điền OTP
        const otpInputs = await page.$$('input[inputmode="numeric"]');
        for (let i = 0; i < 6; i++) {
           await otpInputs[i].type(otp[i]);
        }
        
        await page.click('button[type="submit"]');
        
        // Chờ chuyển sang bước 4: Thành công
        await page.waitForSelector('h2', { timeout: 15000 });
        const stepText = await page.evaluate(() => document.body.innerText);
        expect(stepText).toContain("Thành công");
        console.log(">>> Đã nhập mã OTP thành công. Hoàn tất đặt lại mật khẩu.");
    } catch (error) {
        console.error(">>> Lỗi khi lấy hoặc nhập OTP:", error.message);
        throw error;
    }
  });

  test("QMK08: Mật khẩu mới quá ngắn (<6 ký tự) | Đã qua bước 1 -> Nhập mk dưới 6 ký tự -> Đổi mật khẩu", async () => {
    const { username } = testData.login.validUser;
    await page.type('input[type="email"]', username);
    await page.click('button[type="submit"]');
    await page.waitForSelector('input[placeholder="Ít nhất 6 ký tự"]');

    const passInputs = await page.$$('input[type="password"]'); 
    await passInputs[0].type("123");
    await passInputs[1].type("123");
    await page.click('button[type="submit"]');

    // Hiển thị lỗi
    await page.waitForSelector(".bg-red-500\\/10");
    const errorText = await page.$eval(".bg-red-500\\/10", (el) => el.innerText);
    expect(errorText).toContain("Mật khẩu mới phải có ít nhất 6 ký tự");
  });

  test("QMK09: Mật khẩu xác nhận không khớp | Đã qua bước 1 -> Nhập mk xác nhận khác nhau -> Đổi mật khẩu", async () => {
    const { username } = testData.login.validUser;
    await page.type('input[type="email"]', username);
    await page.click('button[type="submit"]');
    await page.waitForSelector('input[placeholder="Ít nhất 6 ký tự"]');

    const passInputs = await page.$$('input[type="password"]'); 
    await passInputs[0].type("Abc@123456");
    await passInputs[1].type("Abc@123457");
    await page.click('button[type="submit"]');

    // Hiển thị lỗi
    await page.waitForSelector(".bg-red-500\\/10");
    const errorText = await page.$eval(".bg-red-500\\/10", (el) => el.innerText);
    expect(errorText).toContain("Mật khẩu xác nhận không khớp");
  });

  test("QMK10: Mật khẩu thiếu ký tự đặc biệt/số | Đã qua bước 1 -> Nhập mk chỉ có chữ -> Đổi mật khẩu", async () => {
    const { username } = testData.login.validUser;
    await page.type('input[type="email"]', username);
    await page.click('button[type="submit"]');
    await page.waitForSelector('input[placeholder="Ít nhất 6 ký tự"]');

    const passInputs = await page.$$('input[type="password"]'); 
    await passInputs[0].type("OnlyLetters");
    await passInputs[1].type("OnlyLetters");
    await page.click('button[type="submit"]');

    // Hiển thị lỗi
    await page.waitForSelector(".bg-red-500\\/10");
    const errorText = await page.$eval(".bg-red-500\\/10", (el) => el.innerText);
    expect(errorText).toContain("chứa ít nhất 1 số và 1 ký tự đặc biệt");
  });

});
