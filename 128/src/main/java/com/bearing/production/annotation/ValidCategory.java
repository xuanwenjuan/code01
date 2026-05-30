package com.bearing.production.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = CategoryValidator.class)
@Documented
public @interface ValidCategory {
    String message() default "无效的品类ID";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    boolean checkActive() default true;
}
