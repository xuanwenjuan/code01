package com.oiledumbrella.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface OperationLog {
    String operationType() default "";
    String businessType() default "";
    String description() default "";
}
