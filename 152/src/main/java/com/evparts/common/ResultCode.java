package com.evparts.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未登录或登录已过期"),
    FORBIDDEN(403, "没有权限"),
    NOT_FOUND(404, "资源不存在"),
    SERVER_ERROR(500, "服务器内部错误"),

    USER_NOT_EXIST(1001, "用户不存在"),
    USER_PASSWORD_ERROR(1002, "密码错误"),
    USER_DISABLED(1003, "用户已被禁用"),
    USERNAME_EXIST(1004, "用户名已存在"),

    CATEGORY_NOT_EXIST(2001, "产品分类不存在"),
    CATEGORY_HAS_CHILDREN(2002, "该分类下存在子分类，无法删除"),
    CATEGORY_HAS_PRODUCTS(2003, "该分类下存在产品，无法删除"),

    PRODUCT_NOT_EXIST(3001, "产品不存在"),
    PRODUCT_CODE_EXIST(3002, "产品编码已存在"),

    MATERIAL_NOT_EXIST(4001, "原料不存在"),
    MATERIAL_CODE_EXIST(4002, "原料编码已存在"),

    STOCK_NOT_EXIST(5001, "库存不存在"),
    STOCK_INSUFFICIENT(5002, "库存不足"),
    BATCH_NO_EXIST(5003, "批次编码已存在"),

    WORK_ORDER_NOT_EXIST(6001, "工单不存在"),
    WORK_ORDER_STATUS_ERROR(6002, "工单状态不允许此操作"),
    WORK_ORDER_NO_EXIST(6003, "工单编号已存在"),

    COST_NOT_EXIST(7001, "成本记录不存在"),
    COST_STATUS_ERROR(7002, "成本状态不允许此操作"),
    COST_ALREADY_EXIST(7003, "该工单已存在成本记录"),

    PROCESS_NOT_CONFIRMED(8001, "工艺未确认，请先确认工艺"),
    PROCESS_ALREADY_CONFIRMED(8002, "工艺已确认，无需重复操作"),
    MATERIAL_LOCKED(8003, "原料已被其他工单锁定"),
    STOCK_LOCK_INSUFFICIENT(8004, "可用库存不足（含锁定）"),

    DATA_INTEGRITY_ERROR(9001, "数据完整性错误"),
    OPERATION_TOO_FREQUENT(9002, "操作过于频繁，请稍后再试");

    private final Integer code;
    private final String message;

}
