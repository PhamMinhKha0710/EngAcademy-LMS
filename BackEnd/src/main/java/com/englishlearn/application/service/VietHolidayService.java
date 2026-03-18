package com.englishlearn.application.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * Kiểm tra ngày lễ Việt Nam - dùng cho badge holiday_learner.
 * Danh sách ngày lễ cố định (dương lịch).
 */
@Service
public class VietHolidayService {

    /**
     * Kiểm tra ngày có phải ngày lễ VN không.
     * Các ngày: 1/1, 30/4, 1/5, 2/9 (bỏ qua năm, chỉ so sánh tháng-ngày).
     */
    public boolean isHoliday(LocalDate date) {
        if (date == null) return false;
        int month = date.getMonthValue();
        int day = date.getDayOfMonth();

        // 1/1 - Tết Dương lịch
        if (month == 1 && day == 1) return true;
        // 30/4 - Giải phóng miền Nam
        if (month == 4 && day == 30) return true;
        // 1/5 - Quốc tế Lao động
        if (month == 5 && day == 1) return true;
        // 2/9 - Quốc khánh
        if (month == 9 && day == 2) return true;

        return false;
    }
}
