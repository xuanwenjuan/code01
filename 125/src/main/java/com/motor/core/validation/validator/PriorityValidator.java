package com.motor.core.validation.validator;

import com.motor.core.validation.annotation.PriorityValid;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;
import java.util.List;

public class PriorityValidator implements ConstraintValidator<PriorityValid, Integer> {
    private static final List<Integer> VALID_PRIORITIES = Arrays.asList(1, 2, 3);

    @Override
    public boolean isValid(Integer value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }
        return VALID_PRIORITIES.contains(value);
    }
}
