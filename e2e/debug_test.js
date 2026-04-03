const puppeteer = require("puppeteer");
const { delay } = require("./Utils/helpers");

const APP_URL = "http://localhost:3000";

async function run() {
    console.log("🚀 Bắt đầu quá trình debug E2E...");
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100, // Làm chậm để dễ nhìn
        args: ["--window-size=1280,800"],
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        console.log(`Step 1: Điều hướng tới ${APP_URL}/register...`);
        await page.goto(`${APP_URL}/register`, { waitUntil: 'networkidle2' });
        console.log("✅ Đã điều hướng xong.");

        await delay(2000); // Chờ React render xong

        console.log("Step 2: Kiểm tra các ID trong DOM...");
        const ids = await page.evaluate(() => {
            return {
                fullName: !!document.getElementById('fullName'),
                username: !!document.getElementById('username'),
                email: !!document.getElementById('email'),
                password: !!document.getElementById('password'),
                confirmPassword: !!document.getElementById('confirmPassword'),
                nextStep: !!document.getElementById('nextStep'),
            };
        });
        console.log("Kết quả kiểm tra ID:", ids);

        if (!ids.fullName) {
            console.log("❌ LỖI: Không tìm thấy #fullName. Có vẻ frontend chưa cập nhật code mới có ID.");
            // In ra HTML để xem nó là gì
            const html = await page.evaluate(() => document.body.innerHTML.slice(0, 500));
            console.log("HTML Snippet:", html);
        } else {
            console.log("Step 3: Thử điền vào field #fullName...");
            await page.type('#fullName', "Debug User", { delay: 100 });
            console.log("✅ Đã điền #fullName.");

            console.log("Step 4: Điền các field còn lại...");
            await page.type('#username', "debuguser", { delay: 50 });
            await page.type('#email', "debug@example.com", { delay: 50 });
            await page.type('#password', "Password123", { delay: 50 });
            await page.type('#confirmPassword', "Password123", { delay: 50 });

            console.log("Step 5: Click Next Step...");
            await page.click('#nextStep');
            console.log("✅ Đã click #nextStep.");
            
            await delay(3000);
            const currentTitle = await page.evaluate(() => document.querySelector('h1')?.textContent);
            console.log("Tiêu đề trang hiện tại sau khi click:", currentTitle);
        }

    } catch (err) {
        console.error("❌ Xảy ra lỗi trong quá trình debug:", err);
    } finally {
        console.log("Kết thúc debug. Chờ 5 giây trước khi đóng browser...");
        await delay(5000);
        await browser.close();
    }
}

run();
