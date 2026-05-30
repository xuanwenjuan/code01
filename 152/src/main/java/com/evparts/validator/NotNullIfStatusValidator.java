package com.evparts.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.lang.reflect.Field;

public class NotNullIfStatusValidator implements ConstraintValidator<NotNullIfStatus, Object> {

    private String statusField;
    private String targetField;
    private String[] requiredStatuses;

    @Override
    public void initialize(NotNullIfStatus constraintAnnotation) {
        this.statusField = constraintAnnotation.statusField();
        this.targetField = constraintAnnotation.targetField();
        this.requiredStatuses = constraintAnnotation.requiredStatuses();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        try {
            Field statusFieldObj = value.getClass().getDeclaredField(statusField);
            statusFieldObj.setAccessible(true);
            Object statusValue = statusFieldObj.get(value);

            if (statusValue == null) {
                return true;
            }

            boolean shouldCheck = false;
            for (String requiredStatus : requiredStatuses) {
                if (requiredStatus.equals(statusValue.toString())) {
                    shouldCheck = true;
                    break;
                }
            }

            if (!shouldCheck) {
                return true;
            }

            Field targetFieldObj = value.getClass().getDeclaredField(targetField);
            targetFieldObj.setAccessible(true);
            Object targetValue = targetFieldObj.get(value);

            if (targetValue == null) {
                return false;
            }

            if (targetValue instanceof String && ((String) targetValue).trim().isEmpty()) {
                return false;
            }

            return true;

        } catch (Exception e) {
            return true;
        }
    }

}
