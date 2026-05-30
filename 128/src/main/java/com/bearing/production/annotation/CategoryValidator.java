package com.bearing.production.annotation;

import com.bearing.production.service.BearingCategoryService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CategoryValidator implements ConstraintValidator<ValidCategory, Long> {

    private final BearingCategoryService categoryService;
    private boolean checkActive;

    @Override
    public void initialize(ValidCategory constraintAnnotation) {
        this.checkActive = constraintAnnotation.checkActive();
    }

    @Override
    public boolean isValid(Long categoryId, ConstraintValidatorContext context) {
        if (categoryId == null) {
            return true;
        }

        try {
            if (checkActive) {
                return categoryService.isCategoryActive(categoryId);
            }
            return categoryService.getById(categoryId) != null;
        } catch (Exception e) {
            log.error("验证品类ID失败", e);
            return false;
        }
    }
}
