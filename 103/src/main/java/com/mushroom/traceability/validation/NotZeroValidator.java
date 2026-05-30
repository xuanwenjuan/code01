package com.mushroom.traceability.validation;

import com.mushroom.traceability.annotation.NotZero;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.math.BigDecimal;

public class NotZeroValidator implements ConstraintValidator<NotZero, Number> {

    @Override
    public void initialize(NotZero constraintAnnotation) {
    }

    @Override
    public boolean isValid(Number value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }
        if (value instanceof BigDecimal) {
            return ((BigDecimal) value).compareTo(BigDecimal.ZERO) > 0;
        }
        return value.doubleValue() > 0;
    }
}