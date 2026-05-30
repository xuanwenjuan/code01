package com.amber.polish.common;

import lombok.Getter;

@Getter
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    FAIL(500, "操作失败"),
    VALIDATE_ERROR(400, "参数校验失败"),
    UNAUTHORIZED(401, "未授权访问"),
    FORBIDDEN(403, "权限不足"),
    NOT_FOUND(404, "资源不存在"),

    USER_NOT_FOUND(1001, "用户不存在"),
    USER_PASSWORD_ERROR(1002, "密码错误"),
    USER_DISABLED(1003, "用户已被禁用"),
    USERNAME_EXISTS(1004, "用户名已存在"),

    TOKEN_INVALID(2001, "Token无效"),
    TOKEN_EXPIRED(2002, "Token已过期"),

    STONE_NOT_FOUND(3001, "原石不存在"),
    STONE_STATUS_ERROR(3002, "原石状态异常"),

    ORDER_NOT_FOUND(4001, "工单不存在"),
    ORDER_STATUS_ERROR(4002, "工单状态异常"),

    CATEGORY_NOT_FOUND(5001, "类目不存在"),
    CATEGORY_HAS_CHILDREN(5002, "类目下存在子类目，无法删除");

    private final Integer code;
    private final String message;

    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
