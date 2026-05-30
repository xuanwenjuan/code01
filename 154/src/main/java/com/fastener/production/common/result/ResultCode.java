package com.fastener.production.common.result;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    FAIL(500, "操作失败"),

    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),

    LOGIN_ERROR(1001, "用户名或密码错误"),
    TOKEN_EXPIRED(1002, "Token已过期"),
    TOKEN_INVALID(1003, "Token无效"),

    DATA_NOT_EXIST(2001, "数据不存在"),
    DATA_ALREADY_EXIST(2002, "数据已存在"),
    DATA_STATUS_ERROR(2003, "数据状态错误"),

    PERMISSION_DENIED(3001, "权限不足"),

    STOCK_NOT_ENOUGH(4001, "库存不足"),
    ORDER_STATUS_ERROR(4002, "工单状态错误"),
    BATCH_CODE_ERROR(4003, "批次码生成失败");

    private final Integer code;
    private final String message;
}
