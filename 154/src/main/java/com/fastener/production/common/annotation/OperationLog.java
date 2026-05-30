package com.fastener.production.common.annotation;

import com.fastener.production.common.enums.OperationTypeEnum;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface OperationLog {

    String moduleCode() default "";

    String moduleName() default "";

    OperationTypeEnum operationType();

    String description() default "";
}
