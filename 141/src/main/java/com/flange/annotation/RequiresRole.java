package com.flange.annotation;

import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresRole {
    String[] value();

    Logical logical() default Logical.OR;

    enum Logical {
        AND, OR
    }
}
