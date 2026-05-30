package com.plastic.injection.common;

import lombok.Getter;

@Getter
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    FAIL(500, "操作失败"),
    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未登录或token无效"),
    FORBIDDEN(403, "权限不足"),
    NOT_FOUND(404, "资源不存在"),

    MATERIAL_NOT_FOUND(1001, "原料不存在"),
    MATERIAL_INSUFFICIENT(1002, "原料库存不足"),
    MATERIAL_LOCKED(1003, "原料已被锁定"),

    ORDER_NOT_FOUND(2001, "工单不存在"),
    ORDER_STATUS_ERROR(2002, "工单状态错误"),
    ORDER_ALREADY_FINISHED(2003, "工单已完成"),

    CATEGORY_NOT_FOUND(3001, "产品类目不存在"),
    CATEGORY_DISABLED(3002, "产品类目已下架"),

    COST_ALREADY_EXISTS(4001, "成本核算已存在");

    private final Integer code;
    private final String message;

    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
