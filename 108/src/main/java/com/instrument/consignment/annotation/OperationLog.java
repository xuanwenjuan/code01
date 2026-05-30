package com.instrument.consignment.annotation;

import com.instrument.consignment.enums.BizTypeEnum;
import com.instrument.consignment.enums.OperationTypeEnum;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface OperationLog {

    BizTypeEnum bizType();

    OperationTypeEnum operationType();

    String description() default "";
}
