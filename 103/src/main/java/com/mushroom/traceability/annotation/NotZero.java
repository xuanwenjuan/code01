package com.mushroom.traceability.annotation;

import com.mushroom.traceability.validation.NotZeroValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = NotZeroValidator.class)
public @interface NotZero {
    String message() default "数值不能为零或负数";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}