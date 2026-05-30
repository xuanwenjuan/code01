package com.aromatherapy.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = PurityValidator.class)
public @interface ValidPurity {
    String message() default "纯度必须在0-100之间";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
