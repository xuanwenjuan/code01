package com.mining.maintenance.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Log {

    String operationModule() default "";

    String operationType() default "";

    String operationDesc() default "";
}