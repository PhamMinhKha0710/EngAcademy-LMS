// Hàm tiện ích delay thay thế cho page.waitForTimeout (đã bị xóa từ Puppeteer v22)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    delay
};
