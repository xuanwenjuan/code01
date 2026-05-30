package com.textile.production.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = BigDecimalRangeValidator.class)
public @interface BigDecimalRange {

    String message() default "数值范围不正确";

    String min() default "0";

    String max() default "";

    boolean allowZero() default true;

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
