package com.cosmetics.common;

import lombok.Getter;

@Getter
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    ERROR(500, "操作失败"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未授权，请先登录"),
    FORBIDDEN(403, "权限不足，禁止访问"),
    NOT_FOUND(404, "请求资源不存在"),

    LOGIN_ERROR(1001, "用户名或密码错误"),
    TOKEN_EXPIRED(1002, "Token已过期"),
    TOKEN_INVALID(1003, "Token无效"),
    USER_DISABLED(1004, "账号已被禁用"),
    USER_NOT_FOUND(1005, "用户不存在"),
    USER_ALREADY_EXISTS(1006, "用户名已存在"),

    DATA_NOT_FOUND(2001, "数据不存在"),
    DATA_ALREADY_EXISTS(2002, "数据已存在"),
    DATA_INTEGRITY_ERROR(2003, "数据完整性错误"),

    INVENTORY_SHORTAGE(3001, "库存不足"),
    INVENTORY_WARNING(3002, "库存预警"),
    BATCH_EXPIRED(3003, "批次已过期"),

    WORKORDER_STATUS_ERROR(4001, "工单状态错误"),
    WORKORDER_NOT_FOUND(4002, "工单不存在"),

    FORMULA_ERROR(5001, "配方错误"),
    FORMULA_NOT_FOUND(5002, "配方不存在");

    private final Integer code;
    private final String message;

    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
