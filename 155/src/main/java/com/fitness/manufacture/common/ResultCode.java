package com.fitness.manufacture.common;

import lombok.Getter;

@Getter
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    FAIL(500, "操作失败"),
    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),

    LOGIN_USER_NOT_EXIST(1001, "用户不存在"),
    LOGIN_PASSWORD_ERROR(1002, "密码错误"),
    LOGIN_USER_DISABLED(1003, "用户已禁用"),
    TOKEN_INVALID(1004, "Token无效"),
    TOKEN_EXPIRED(1005, "Token已过期"),

    DATA_EXIST(2001, "数据已存在"),
    DATA_NOT_EXIST(2002, "数据不存在"),
    DATA_STATUS_ERROR(2003, "数据状态错误"),

    MATERIAL_NOT_ENOUGH(3001, "物料库存不足"),
    BATCH_CODE_EXIST(3002, "批次编号已存在"),
    ORDER_STATUS_ERROR(3003, "工单状态错误"),
    PRODUCT_STOP_PRODUCE(3004, "产品已停止量产"),

    CATEGORY_HAS_CHILDREN(4001, "分类下存在子分类，无法删除"),
    CATEGORY_HAS_PRODUCTS(4002, "分类下存在产品，无法删除"),

    BUSINESS_ERROR(5001, "业务处理异常");

    private final Integer code;
    private final String message;

    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
