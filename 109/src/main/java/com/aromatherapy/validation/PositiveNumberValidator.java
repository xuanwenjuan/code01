package com.aromatherapy.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.math.BigDecimal;

public class PositiveNumberValidator implements ConstraintValidator<ValidPositiveNumber, BigDecimal> {

    @Override
    public boolean isValid(BigDecimal value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }
        return value.compareTo(BigDecimal.ZERO) > 0;
    }
}
