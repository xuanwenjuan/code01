package com.instrument.consignment.annotation;

import com.instrument.consignment.enums.UserRoleEnum;

import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresRole {
    UserRoleEnum[] value();
}
