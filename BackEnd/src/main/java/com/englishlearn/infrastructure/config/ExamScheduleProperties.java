package com.englishlearn.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Component
@ConfigurationProperties(prefix = "application.exam")
public class ExamScheduleProperties {

    /**
     * Wall-clock zone for exam start/end (naive LocalDateTime in DB). Default Vietnam.
     */
    private String scheduleZone = "Asia/Ho_Chi_Minh";

    public ZoneId getScheduleZoneId() {
        return ZoneId.of(scheduleZone);
    }

    public LocalDateTime now() {
        return LocalDateTime.now(getScheduleZoneId());
    }

    public String getScheduleZone() {
        return scheduleZone;
    }

    public void setScheduleZone(String scheduleZone) {
        this.scheduleZone = scheduleZone;
    }
}
