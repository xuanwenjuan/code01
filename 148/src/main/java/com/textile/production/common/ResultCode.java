package com.textile.production.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    ERROR(500, "操作失败"),
    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未授权，请先登录"),
    FORBIDDEN(403, "权限不足，无法访问"),
    NOT_FOUND(404, "资源不存在"),
    SYSTEM_ERROR(500, "系统异常"),

    LOGIN_ERROR(1001, "用户名或密码错误"),
    TOKEN_EXPIRED(1002, "Token已过期"),
    TOKEN_INVALID(1003, "Token无效"),
    USER_DISABLED(1004, "账号已被禁用"),

    DATA_NOT_EXIST(2001, "数据不存在"),
    DATA_ALREADY_EXIST(2002, "数据已存在"),
    DATA_IN_USE(2003, "数据正在使用中，无法删除"),

    STOCK_NOT_ENOUGH(3001, "库存不足"),
    BATCH_CODE_GENERATE_FAIL(3002, "批次编码生成失败"),
    ORDER_STATUS_ERROR(3003, "工单状态错误，无法执行该操作"),
    ORDER_TIMEOUT(3004, "工单已超期，自动暂停");

    private final Integer code;
    private final String message;
}
