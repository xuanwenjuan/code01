package com.aromatherapy.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.math.BigDecimal;

public class PurityValidator implements ConstraintValidator<ValidPurity, BigDecimal> {

    @Override
    public boolean isValid(BigDecimal purity, ConstraintValidatorContext context) {
        if (purity == null) {
            return true;
        }
        return purity.compareTo(BigDecimal.ZERO) > 0 && purity.compareTo(new BigDecimal("100")) <= 0;
    }
}
