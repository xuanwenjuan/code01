package com.household.management.common.annotation;

import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresPermission {

    String value() default "";

    String[] permissions() default {};

    Logical logical() default Logical.AND;

    enum Logical {
        AND, OR
    }
}
