package com.englishlearn.application.dto.request;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ValidPreferredTopicsValidator.class)
@Documented
public @interface ValidPreferredTopics {
    String message() default "Mỗi chủ đề không được dài hơn 20 ký tự và tối đa 20 chủ đề";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
