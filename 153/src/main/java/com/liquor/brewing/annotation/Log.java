package com.liquor.brewing.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Log {

    String module() default "";

    String operationType() default "";

    String description() default "";
}
