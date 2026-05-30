package com.liquor.brewing.common;

import lombok.Getter;

@Getter
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    FAIL(500, "操作失败"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未登录或登录已过期"),
    FORBIDDEN(403, "权限不足"),
    NOT_FOUND(404, "资源不存在"),
    METHOD_NOT_ALLOWED(405, "请求方法不支持"),
    SERVER_ERROR(500, "服务器内部错误"),

    USER_NOT_EXIST(1001, "用户不存在"),
    USER_PASSWORD_ERROR(1002, "密码错误"),
    USER_DISABLED(1003, "用户已被禁用"),
    USER_ALREADY_EXIST(1004, "用户名已存在"),

    TOKEN_INVALID(2001, "Token无效"),
    TOKEN_EXPIRED(2002, "Token已过期"),
    TOKEN_EMPTY(2003, "Token不能为空"),

    DATA_NOT_EXIST(3001, "数据不存在"),
    DATA_ALREADY_EXIST(3002, "数据已存在"),
    DATA_CANNOT_DELETE(3003, "数据无法删除"),

    MATERIAL_INSUFFICIENT(4001, "物料库存不足"),
    MATERIAL_EXPIRED(4002, "物料已过期"),
    MATERIAL_FROZEN(4003, "物料已冻结"),

    WORK_ORDER_STATUS_ERROR(5001, "工单状态错误"),
    WORK_ORDER_ALREADY_FINISHED(5002, "工单已完成"),
    WORK_ORDER_ALREADY_FROZEN(5003, "工单已冻结");

    private final Integer code;
    private final String message;

    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
