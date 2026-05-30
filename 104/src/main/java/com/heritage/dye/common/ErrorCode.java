package com.heritage.dye.common;

import lombok.Getter;

@Getter
public enum ErrorCode {
    SUCCESS(200, "操作成功"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未登录或登录已过期"),
    FORBIDDEN(403, "权限不足"),
    NOT_FOUND(404, "资源不存在"),
    SYSTEM_ERROR(500, "系统内部错误"),

    CATEGORY_CODE_EXIST(1001, "类目编码已存在"),
    CATEGORY_NOT_EXIST(1002, "类目不存在"),
    CATEGORY_DISABLED(1003, "类目已下架"),
    CATEGORY_HAS_CHILDREN(1004, "存在子类目，无法删除"),

    ORIGIN_CODE_EXIST(2001, "产地编码已存在"),
    ORIGIN_NOT_EXIST(2002, "产地不存在"),
    INSUFFICIENT_STOCK(2003, "原料库存不足"),
    STOCK_LOCK_FAILED(2004, "库存锁定失败"),

    ORDER_NOT_EXIST(3001, "工单不存在"),
    ORDER_FROZEN(3002, "工单已冻结"),
    ORDER_COMPLETED(3003, "工单已完成"),
    INVALID_STEP(3004, "工序操作无效，请按顺序执行"),
    STEP_NOT_STARTED(3005, "工序未开始"),
    STEP_COMPLETED(3006, "工序已完成"),

    USER_NOT_EXIST(4001, "用户不存在"),
    USER_DISABLED(4002, "用户已禁用"),
    PASSWORD_ERROR(4003, "密码错误"),

    LEDGER_NOT_EXIST(5001, "台账记录不存在"),

    OPERATION_LOG_FAILED(6001, "操作日志记录失败");

    private final Integer code;
    private final String message;

    ErrorCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
