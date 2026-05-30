package com.textile.production.annotation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.math.BigDecimal;

public class BigDecimalRangeValidator implements ConstraintValidator<BigDecimalRange, BigDecimal> {

    private BigDecimal min;
    private BigDecimal max;
    private boolean allowZero;

    @Override
    public void initialize(BigDecimalRange constraintAnnotation) {
        this.min = new BigDecimal(constraintAnnotation.min());
        this.max = constraintAnnotation.max().isEmpty() ? null : new BigDecimal(constraintAnnotation.max());
        this.allowZero = constraintAnnotation.allowZero();
    }

    @Override
    public boolean isValid(BigDecimal value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        if (!allowZero && value.compareTo(BigDecimal.ZERO) == 0) {
            return false;
        }

        if (value.compareTo(min) < 0) {
            return false;
        }

        if (max != null && value.compareTo(max) > 0) {
            return false;
        }

        return true;
    }
}
