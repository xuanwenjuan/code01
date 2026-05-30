package com.fitness.manufacture.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Log {

    String module() default "";

    String operation() default "";

    String businessType() default "OTHER";
}
