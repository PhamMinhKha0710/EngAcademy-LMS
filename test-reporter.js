const CustomReporter = require('./e2e/CustomReporter');

const reporter = new CustomReporter({}, {});
const mockResults = {
    numTotalTests: 2,
    numPassedTests: 1,
    numFailedTests: 1,
    testResults: [
        {
            testResults: [
                {
                    ancestorTitles: ['KỊCH BẢN KIỂM THỬ E2E TOÀN DIỆN (CHẠY TUẦN TỰ)', 'PHẦN 1: HÀNH TRÌNH NGƯỜI DÙNG CƠ BẢN'],
                    title: '1. Luồng Người Dùng Mới',
                    duration: 1500,
                    status: 'passed'
                },
                {
                    ancestorTitles: ['KỊCH BẢN KIỂM THỬ E2E TOÀN DIỆN (CHẠY TUẦN TỰ)', 'PHẦN 2: KIỂM THỬ CHUYÊN SÂU MODULE ĐĂNG NHẬP'],
                    title: 'TC-LOGIN-02: Sai mật khẩu',
                    duration: 2000,
                    status: 'failed'
                }
            ]
        }
    ]
};

reporter.onRunComplete(null, mockResults);
