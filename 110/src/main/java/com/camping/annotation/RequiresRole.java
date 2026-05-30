package com.camping.annotation;

import com.camping.enums.RoleEnum;

import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresRole {
    RoleEnum[] value();
}
