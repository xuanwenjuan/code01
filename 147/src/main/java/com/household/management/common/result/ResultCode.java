package com.household.management.common.result;

import lombok.Getter;

@Getter
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    FAIL(500, "操作失败"),
    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),
    METHOD_NOT_ALLOWED(405, "方法不允许"),
    SYSTEM_ERROR(500, "系统错误"),

    USER_NOT_EXIST(1001, "用户不存在"),
    USER_PASSWORD_ERROR(1002, "密码错误"),
    USER_DISABLED(1003, "用户已禁用"),
    USER_EXIST(1004, "用户名已存在"),

    TOKEN_INVALID(2001, "Token无效"),
    TOKEN_EXPIRED(2002, "Token已过期"),

    DATA_NOT_EXIST(3001, "数据不存在"),
    DATA_EXIST(3002, "数据已存在"),

    STOCK_NOT_ENOUGH(4001, "库存不足"),
    STATUS_ERROR(4002, "状态错误"),

    AUDIT_ERROR(5001, "审核失败"),
    OPERATION_ERROR(5002, "操作失败");

    private final Integer code;
    private final String message;

    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
