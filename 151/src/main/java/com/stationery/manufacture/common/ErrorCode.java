package com.stationery.manufacture.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    SUCCESS(200, "操作成功"),
    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未授权，请先登录"),
    FORBIDDEN(403, "权限不足"),
    NOT_FOUND(404, "资源不存在"),
    SYSTEM_ERROR(500, "系统异常"),
    LOGIN_ERROR(1001, "用户名或密码错误"),
    TOKEN_EXPIRED(1002, "Token已过期"),
    TOKEN_INVALID(1003, "Token无效"),
    USER_DISABLED(1004, "账号已被禁用"),
    DATA_EXISTS(2001, "数据已存在"),
    DATA_NOT_EXISTS(2002, "数据不存在"),
    STOCK_NOT_ENOUGH(3001, "库存不足"),
    STATUS_ERROR(3002, "状态错误"),
    OPERATION_NOT_ALLOWED(3003, "不允许的操作");

    private final Integer code;
    private final String message;
}
