package com.mushroom.traceability.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = TaskStatusValidator.class)
public @interface ValidTaskStatus {
    String message() default "无效的任务状态";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}