package com.sheetmetal.compressor.annotation;

import com.sheetmetal.compressor.enums.UserRole;

import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresRole {
    UserRole[] value();
}
