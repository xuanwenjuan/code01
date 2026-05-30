package com.bee.equipment.common;

import lombok.Getter;

@Getter
public enum ResultCodeEnum {

    SUCCESS(200, "操作成功"),
    ERROR(500, "操作失败"),
    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),

    USERNAME_OR_PASSWORD_ERROR(1001, "用户名或密码错误"),
    USER_DISABLED(1002, "用户已被禁用"),
    TOKEN_EXPIRED(1003, "Token已过期"),
    TOKEN_INVALID(1004, "Token无效"),

    STOCK_NOT_ENOUGH(2001, "库存不足"),
    MATERIAL_NOT_EXIST(2002, "物料不存在"),
    WORK_ORDER_NOT_EXIST(2003, "工单不存在"),
    WORK_ORDER_STATUS_ERROR(2004, "工单状态错误"),

    CATEGORY_NOT_EXIST(3001, "类目不存在"),
    CATEGORY_HAS_CHILDREN(3002, "类目下有子类目，无法删除");

    private final Integer code;
    private final String message;

    ResultCodeEnum(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
