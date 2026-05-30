package com.paper.production.annotation;

import com.paper.production.enums.RoleEnum;

import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresRoles {

    RoleEnum[] value();

    Logical logical() default Logical.OR;

    enum Logical {
        AND,
        OR
    }
}
