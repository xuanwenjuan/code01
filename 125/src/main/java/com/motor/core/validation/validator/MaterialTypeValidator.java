package com.motor.core.validation.validator;

import com.motor.core.validation.annotation.MaterialTypeValid;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;
import java.util.List;

public class MaterialTypeValidator implements ConstraintValidator<MaterialTypeValid, String> {
    private static final List<String> VALID_TYPES = Arrays.asList(
        "无取向硅钢卷", "取向硅钢卷", "绝缘涂层辅料"
    );

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return true;
        }
        return VALID_TYPES.contains(value);
    }
}
