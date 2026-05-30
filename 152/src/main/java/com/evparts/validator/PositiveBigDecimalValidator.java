package com.evparts.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.math.BigDecimal;

public class PositiveBigDecimalValidator implements ConstraintValidator<PositiveBigDecimal, BigDecimal> {

    private boolean canBeZero;

    @Override
    public void initialize(PositiveBigDecimal constraintAnnotation) {
        this.canBeZero = constraintAnnotation.canBeZero();
    }

    @Override
    public boolean isValid(BigDecimal value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        if (canBeZero) {
            return value.compareTo(BigDecimal.ZERO) >= 0;
        } else {
            return value.compareTo(BigDecimal.ZERO) > 0;
        }
    }

}
