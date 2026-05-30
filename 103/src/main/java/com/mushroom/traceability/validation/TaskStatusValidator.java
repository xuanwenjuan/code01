package com.mushroom.traceability.validation;

import com.mushroom.traceability.common.Constants;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;

public class TaskStatusValidator implements ConstraintValidator<ValidTaskStatus, String> {

    private static final List<String> VALID_STATUSES = Arrays.asList(
        Constants.TASK_STATUS_PENDING,
        Constants.TASK_STATUS_ASSIGNED,
        Constants.TASK_STATUS_COLLECTING,
        Constants.TASK_STATUS_QUALITY_CHECK,
        Constants.TASK_STATUS_WAREHOUSE,
        Constants.TASK_STATUS_SHIPPED,
        Constants.TASK_STATUS_EXPIRED,
        Constants.TASK_STATUS_CANCELLED
    );

    @Override
    public void initialize(ValidTaskStatus constraintAnnotation) {
    }

    @Override
    public boolean isValid(String status, ConstraintValidatorContext context) {
        if (!StringUtils.hasText(status)) {
            return true;
        }
        return VALID_STATUSES.contains(status);
    }
}