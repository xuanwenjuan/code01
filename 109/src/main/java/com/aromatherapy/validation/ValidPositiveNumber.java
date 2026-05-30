package com.aromatherapy.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = PositiveNumberValidator.class)
public @interface ValidPositiveNumber {
    String message() default "数值必须大于0";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
