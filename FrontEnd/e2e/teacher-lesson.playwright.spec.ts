import { test, expect } from '@playwright/test';

// Định nghĩa base URL, có thể đưa vào playwright.config.ts sau
const BASE_URL = 'http://localhost:5173'; // Thay bằng port thực tế của bạn

test.describe('Teacher Lesson Management Tests', () => {

  // Test TL01 + TL02 gộp chung: Đăng nhập và vào trang danh sách
  test.beforeEach(async ({ page }) => {
    // 1. Đăng nhập
    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder('Email').fill('teacher@example.com');
    await page.getByPlaceholder('Mật khẩu').fill('password123');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();

    // Playwright TỰ ĐỘNG chờ quá trình chuyển trang và API trả về
    await page.goto(`${BASE_URL}/teacher/lessons`);
    
    // Playwright tự động chờ cho đến khi table xuất hiện, không cần setTimeout!
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('TL03: Create New Lesson', async ({ page }) => {
    // 1. Tìm và click nút "Tạo bài học" bằng text (Locator sát với End-User nhất)
    await page.getByRole('button', { name: /Tạo( bài học)?/i }).click();

    // 2. Chờ modal xuất hiện tự động
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 3. Điền các trường thông tin - Code siêu ngắn và chắc chắn
    const timestamp = Date.now();
    const title = `Test Lesson PW ${timestamp}`;

    // Playwright tự động focus, xóa text cũ và điền text mới
    await page.getByTestId('lesson-title-input').fill(title);
    
    // Chọn option từ thẻ select
    await page.getByTestId('lesson-difficulty-select').selectOption('3');
    
    // 4. Bật Checkbox Publish (Tự động kiểm tra trạng thái trước khi tick)
    await page.getByTestId('lesson-publish-checkbox').check();

    // 5. Thử qua tab Review (Không cần try...catch, Playwright tự chờ element ready)
    await page.getByTestId('tab-review').click();
    
    // 6. Nhấn Lưu và Confirm
    await page.getByTestId('lesson-save-primary').click();
    await page.getByTestId('lesson-save-confirm').click();

    // 7. Xác nhận test thêm thành công - Tìm text TRONG table
    const table = page.getByRole('table');
    // toBeVisible() sẽ tự động poll và retry cho đến khi bài học xuất hiện (Timeout mặc định 30s)
    await expect(table.getByText(title)).toBeVisible();
  });

  test('TL04: Edit Existing Lesson', async ({ page }) => {
    // 1. Tìm dòng chạy đầu tiên có nút Sửa và click
    // first() lấy element đầu tiên, thay vì đếm mảng phức tạp như Puppeteer
    await page.getByRole('button', { name: 'Sửa' }).first().click();

    // 2. Chờ dialog tự động
    await expect(page.getByRole('dialog')).toBeVisible();

    // 3. Xóa text cũ và sửa title mới
    const newTitle = `Edited Lesson PW ${Date.now()}`;
    const titleInput = page.getByTestId('lesson-title-input');
    await titleInput.fill(newTitle); // Hàm fill tự động xóa text cũ

    // 4. Lưu lại
    await page.getByTestId('lesson-save-primary').click();
    await page.getByTestId('lesson-save-confirm').click();

    // 5. Xác nhận đã update trong table (Tự chờ list cập nhật)
    await expect(page.getByRole('table').getByText(newTitle)).toBeVisible();
  });

});
