package com.motor.core.validation.annotation;

import com.motor.core.validation.validator.MaterialTypeValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = MaterialTypeValidator.class)
public @interface MaterialTypeValid {
    String message() default "物料类型不合法";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
