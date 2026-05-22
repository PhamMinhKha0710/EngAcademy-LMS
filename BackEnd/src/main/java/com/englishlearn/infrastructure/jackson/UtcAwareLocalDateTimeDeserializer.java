package com.englishlearn.infrastructure.jackson;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;

/**
 * Parses ISO-8601 with offset/Z into application schedule-zone local time; naive strings stay as-is.
 */
public class UtcAwareLocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {

    private static final ZoneId DEFAULT_EXAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    @Override
    public LocalDateTime deserialize(JsonParser parser, DeserializationContext context) throws IOException {
        String text = parser.getText();
        if (text == null || text.isBlank()) {
            return null;
        }
        try {
            return OffsetDateTime.parse(text).atZoneSameInstant(DEFAULT_EXAM_ZONE).toLocalDateTime();
        } catch (DateTimeParseException ignored) {
            return LocalDateTime.parse(text);
        }
    }
}
