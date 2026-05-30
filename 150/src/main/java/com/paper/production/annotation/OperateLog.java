package com.paper.production.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface OperateLog {

    String module() default "";

    String operation() default "";

    String description() default "";
}
