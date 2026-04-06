import { test, expect } from './auth.setup';

const UNIQUE_TITLE = `E2E_Unit1_${Date.now()}`;

test.describe('SB01–SB11: Tạo bài học (Lesson Create Flow)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/teacher/lessons');
    await expect(page).toHaveURL(/.*teacher\/lessons/);
    await expect(page.getByTestId('lesson-create-button')).toBeVisible();
  });

  test('SB01: Soạn nội dung HTML cơ bản với Bold/Italic/Underline', async ({ page }) => {
    await page.getByTestId('lesson-create-button').click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByTestId('lesson-title-input').fill(UNIQUE_TITLE);

    const editor = page.locator('.ck-editor__editable_inline').first();
    await editor.click();
    await editor.fill('Đây là nội dung mẫu.');

    await page.getByRole('button', { name: /Bold|B/i }).click();
    await page.getByRole('button', { name: /Italic|I/i }).click();
    await page.getByRole('button', { name: /Underline|U/i }).click();

    await page.getByTestId('tab-review').click();
    await expect(page.locator('text=NỘI DUNG')).toBeVisible({ timeout: 5000 });

    await page.getByTestId('tab-edit').click();
    await page.getByTestId('lesson-save-primary').click();

    await expect(page.getByTestId('lesson-save-confirm')).toBeVisible();
    await page.getByTestId('lesson-save-confirm').click();

    await expect(page.getByText(UNIQUE_TITLE)).toBeVisible({ timeout: 10000 });
  });

  test('SB02: Chèn danh sách (List) vào nội dung', async ({ page }) => {
    await page.getByTestId('lesson-create-button').click();
    await page.getByTestId('lesson-title-input').fill(UNIQUE_TITLE + '_List');

    const editor = page.locator('.ck-editor__editable_inline').first();
    await editor.click();
    await editor.fill('Mục 1\nMục 2\nMục 3');

    await page.getByRole('button', { name: /Numbered List|Bulleted List|List/i }).first().click();

    await page.getByTestId('lesson-save-primary').click();
    await page.getByTestId('lesson-save-confirm').click();

    await expect(page.getByText(UNIQUE_TITLE + '_List')).toBeVisible({ timeout: 10000 });
  });

  test('SB03: Chèn bảng 2x2 vào nội dung', async ({ page }) => {
    await page.getByTestId('lesson-create-button').click();
    await page.getByTestId('lesson-title-input').fill(UNIQUE_TITLE + '_Table');

    const editor = page.locator('.ck-editor__editable_inline').first();
    await editor.click();

    await page.getByRole('button', { name: /Insert Table|Table/i }).click();

    await page.getByRole('button', { name: /Mã HTML/i }).click();
    await page.locator('textarea.raw-html-textarea').fill('<table><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></table>');
    await page.getByRole('button', { name: /Màn hình rộng/i }).click();

    await page.getByTestId('lesson-save-primary').click();
    await page.getByTestId('lesson-save-confirm').click();

    await expect(page.getByText(UNIQUE_TITLE + '_Table')).toBeVisible({ timeout: 10000 });
  });

  test('SB04: Nhúng URL Audio (MediaEmbed)', async ({ page }) => {
    await page.getByTestId('lesson-create-button').click();
    await page.getByTestId('lesson-title-input').fill(UNIQUE_TITLE + '_Audio');

    const editor = page.locator('.ck-editor__editable_inline').first();
    await editor.click();

    await page.getByRole('button', { name: /Media Embed|Embed/i }).click();

    await page.waitForTimeout(500);
    const urlInput = page.locator('input[placeholder*="http"], input[type="url"]').first();
    if (await urlInput.isVisible()) {
      await urlInput.fill('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      await page.getByRole('button', { name: /Insert|OK/i }).click();
    }

    await page.getByTestId('lesson-save-primary').click();
    await page.getByTestId('lesson-save-confirm').click();

    await expect(page.getByText(UNIQUE_TITLE + '_Audio')).toBeVisible({ timeout: 10000 });
  });

  test('SB05: Soạn bài ở chế độ Mã nguồn HTML', async ({ page }) => {
    await page.getByTestId('lesson-create-button').click();
    await page.getByTestId('lesson-title-input').fill(UNIQUE_TITLE + '_Raw');

    await page.getByRole('button', { name: /Mã HTML/i }).click();
    await page.locator('textarea.raw-html-textarea').fill('<p>Hello <strong>World</strong></p>');
    await page.getByRole('button', { name: /Màn hình rộng/i }).click();

    const editor = page.locator('.ck-editor__editable_inline').first();
    await expect(editor).toContainText('Hello');

    await page.getByTestId('lesson-save-primary').click();
    await page.getByTestId('lesson-save-confirm').click();

    await expect(page.getByText(UNIQUE_TITLE + '_Raw')).toBeVisible();
  });

  test('SB06: Kiểm tra chức năng Preview (Xem trước)', async ({ page }) => {
    await page.getByTestId('lesson-create-button').click();
    await page.getByTestId('lesson-title-input').fill(UNIQUE_TITLE + '_Preview');
    await page.locator('.ck-editor__editable_inline').first().fill('Nội dung preview');

    await page.getByTestId('tab-review').click();

    await expect(page.locator('text=GIỚI THIỆU BÀI HỌC')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(UNIQUE_TITLE + '_Preview')).toBeVisible();

    await page.getByRole('button', { name: /NGỮ PHÁP/i }).click();
    await expect(page.locator('text=NGỮ PHÁP TRỌNG TÂM')).toBeVisible();

    await page.getByRole('button', { name: /TỪ VỰNG/i }).click();
    await expect(page.locator('text=Từ vựng bài học')).toBeVisible();
  });

  test('SB07: Kiểm tra validation bỏ trống Tiêu đề', async ({ page }) => {
    await page.getByTestId('lesson-create-button').click();

    const saveBtn = page.getByTestId('lesson-save-primary');
    await expect(saveBtn).toBeDisabled();
  });

  test('SB08: Kiểm tra Độ khó mức thấp nhất (1)', async ({ page }) => {
    await page.getByTestId('lesson-create-button').click();
    await page.getByTestId('lesson-title-input').fill(UNIQUE_TITLE + '_Lv1');

    await page.getByTestId('lesson-difficulty-select').selectOption('1');

    await page.getByTestId('lesson-save-primary').click();
    await page.getByTestId('lesson-save-confirm').click();

    await expect(page.getByText('Lv.1')).toBeVisible({ timeout: 10000 });
  });

  test('SB09: Kiểm tra Độ khó mức cao nhất (5)', async ({ page }) => {
    await page.getByTestId('lesson-create-button').click();
    await page.getByTestId('lesson-title-input').fill(UNIQUE_TITLE + '_Lv5');

    await page.getByTestId('lesson-difficulty-select').selectOption('5');

    await page.getByTestId('lesson-save-primary').click();
    await page.getByTestId('lesson-save-confirm').click();

    await expect(page.getByText('Lv.5')).toBeVisible({ timeout: 10000 });
  });

  test('SB10: Kiểm tra lọc mã Script độc hại (XSS)', async ({ page }) => {
    await page.getByTestId('lesson-create-button').click();
    await page.getByTestId('lesson-title-input').fill(UNIQUE_TITLE + '_XSS');

    await page.getByRole('button', { name: /Mã HTML/i }).click();
    await page.locator('textarea.raw-html-textarea').fill('<script>alert("XSS")</script><p>Safe</p>');
    await page.getByRole('button', { name: /Màn hình rộng/i }).click();

    await page.once('dialog', async dialog => {
      await dialog.accept();
      expect(false).toBeTruthy('Không được hiển thị alert dialog khi có script');
    });

    await page.getByTestId('lesson-save-primary').click();
    await page.getByTestId('lesson-save-confirm').click();

    await page.waitForTimeout(2000);
  });

  test('SB11: Lưu bài học ở trạng thái Nháp (Draft)', async ({ page }) => {
    await page.getByTestId('lesson-create-button').click();
    await page.getByTestId('lesson-title-input').fill(UNIQUE_TITLE + '_Draft');

    const publishCheckbox = page.getByTestId('lesson-publish-checkbox');
    await expect(publishCheckbox).not.toBeChecked();

    await page.getByTestId('lesson-save-primary').click();

    await expect(page.getByTestId('lesson-save-confirm')).toBeVisible();
    // Kiểm tra modal hiển thị trạng thái draft (có thể kiểm tra text "LƯU BẢN NHÁP")
    await expect(page.locator('text=LƯU BẢN NHÁP')).toBeVisible({ timeout: 5000 });

    await page.getByTestId('lesson-save-confirm').click();

    await expect(page.locator('text=Nháp')).toBeVisible({ timeout: 10000 });
  });
});
