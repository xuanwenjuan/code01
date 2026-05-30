package com.plastic.injection.annotation;

import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ParamValidator {

    boolean required() default false;

    int minLength() default -1;

    int maxLength() default -1;

    String pattern() default "";

    int min() default Integer.MIN_VALUE;

    int max() default Integer.MAX_VALUE;

    String message() default "参数校验失败";
}
