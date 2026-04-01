package com.englishlearn.application.dto.request;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Set;

public class ValidPreferredTopicsValidator implements ConstraintValidator<ValidPreferredTopics, Set<String>> {

    private static final int MAX_SIZE = 20;
    private static final int MAX_TOPIC_LENGTH = 20;

    @Override
    public boolean isValid(Set<String> value, ConstraintValidatorContext context) {
        if (value == null || value.isEmpty()) {
            return true;
        }
        if (value.size() > MAX_SIZE) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                    "Tối đa " + MAX_SIZE + " chủ đề được phép").addConstraintViolation();
            return false;
        }
        for (String topic : value) {
            if (topic != null && topic.length() > MAX_TOPIC_LENGTH) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(
                        "Mỗi chủ đề không được dài hơn " + MAX_TOPIC_LENGTH + " ký tự").addConstraintViolation();
                return false;
            }
        }
        return true;
    }
}
