package com.fishing.distribution.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface OperationLogger {

    String module() default "";

    String type() default "";

    String desc() default "";

    boolean saveRequest() default true;

    boolean saveResponse() default true;
}
