package com.liquor.brewing.annotation;

import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiresRole {

    String[] value();

    String message() default "权限不足，无法访问该资源";
}
