package com.spindle.manage.annotation;

import java.lang.annotation.*;

@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface OperationLogger {

    String value() default "";

    String operationType() default "OTHER";

    String businessType() default "OTHER";

}

