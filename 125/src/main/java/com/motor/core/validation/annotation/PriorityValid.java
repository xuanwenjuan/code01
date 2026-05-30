package com.motor.core.validation.annotation;

import com.motor.core.validation.validator.PriorityValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = PriorityValidator.class)
public @interface PriorityValid {
    String message() default "优先级不合法，只能是1、2、3";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
