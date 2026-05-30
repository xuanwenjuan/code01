package com.fitness.manufacture.annotation;

import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresRoles {
    String[] value() default {};

    String[] postCodes() default {};

    Logical logical() default Logical.OR;

    enum Logical {
        AND,
        OR
    }
}
