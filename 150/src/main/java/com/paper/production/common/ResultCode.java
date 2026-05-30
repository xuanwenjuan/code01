package com.paper.production.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    ERROR(500, "操作失败"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未授权，请登录"),
    FORBIDDEN(403, "权限不足，禁止访问"),
    NOT_FOUND(404, "请求资源不存在"),
    METHOD_NOT_ALLOWED(405, "请求方法不支持"),
    PARAM_ERROR(406, "参数校验失败"),
    TOKEN_EXPIRED(407, "Token已过期"),
    TOKEN_INVALID(408, "Token无效"),
    DATA_NOT_EXIST(1001, "数据不存在"),
    DATA_ALREADY_EXIST(1002, "数据已存在"),
    DATA_CANNOT_DELETE(1003, "数据无法删除"),
    STOCK_INSUFFICIENT(2001, "库存不足"),
    STOCK_OVER_LIMIT(2002, "库存超过上限"),
    BATCH_NOT_EXIST(2003, "批次不存在"),
    ORDER_STATUS_ERROR(3001, "工单状态错误"),
    ORDER_CANNOT_CANCEL(3002, "工单无法取消"),
    ORDER_ALREADY_SCHEDULED(3003, "工单已排产"),
    ROLE_NOT_EXIST(4001, "角色不存在"),
    USER_NOT_EXIST(4002, "用户不存在"),
    USER_PASSWORD_ERROR(4003, "密码错误"),
    USER_DISABLED(4004, "用户已禁用"),
    USERNAME_ALREADY_EXIST(4005, "用户名已存在");

    private final Integer code;
    private final String message;
}
