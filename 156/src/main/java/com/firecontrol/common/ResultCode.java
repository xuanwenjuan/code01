package com.firecontrol.common;

import lombok.Getter;

@Getter
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    ERROR(500, "系统异常"),
    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),
    METHOD_NOT_ALLOWED(405, "方法不允许"),

    LOGIN_ERROR(1001, "用户名或密码错误"),
    TOKEN_EXPIRED(1002, "Token已过期"),
    TOKEN_INVALID(1003, "Token无效"),
    USER_NOT_EXIST(1004, "用户不存在"),
    USER_ALREADY_EXIST(1005, "用户已存在"),
    USER_DISABLED(1006, "用户已被禁用"),

    DATA_NOT_EXIST(2001, "数据不存在"),
    DATA_ALREADY_EXIST(2002, "数据已存在"),
    DATA_IN_USE(2003, "数据正在使用中"),

    WAREHOUSE_NOT_ENOUGH(3001, "库存不足"),
    BATCH_CODE_GENERATE_FAIL(3002, "批次码生成失败"),

    WORK_ORDER_NOT_EXIST(4001, "工单不存在"),
    WORK_ORDER_STATUS_ERROR(4002, "工单状态错误"),
    WORK_ORDER_AUTO_PAUSED(4003, "工单已自动暂停");

    private final Integer code;
    private final String message;

    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
