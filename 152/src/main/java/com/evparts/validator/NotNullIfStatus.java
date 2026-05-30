package com.evparts.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.TYPE, ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = NotNullIfStatusValidator.class)
public @interface NotNullIfStatus {

    String message() default "该状态下此字段不能为空";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    String statusField();

    String targetField();

    String[] requiredStatuses();

}
