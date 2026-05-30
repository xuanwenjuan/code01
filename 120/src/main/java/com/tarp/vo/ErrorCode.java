package com.tarp.vo;

import lombok.Getter;

@Getter
public enum ErrorCode {
    SUCCESS(200, "操作成功"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未登录或token已过期"),
    FORBIDDEN(403, "权限不足，无法访问"),
    NOT_FOUND(404, "请求资源不存在"),
    SYSTEM_ERROR(500, "系统异常，请联系管理员"),
    CATEGORY_DISABLED(1001, "该篷布版型已下架，无法创建工单"),
    MATERIAL_NOT_FOUND(1002, "材料不存在"),
    INSUFFICIENT_STOCK(1003, "材料库存不足"),
    WORK_ORDER_NOT_FOUND(1004, "工单不存在"),
    WORK_ORDER_COMPLETED(1005, "工单已完成，无法修改状态"),
    INVALID_STATUS_TRANSITION(1006, "工单状态流转不合法"),
    INVALID_ROLE(1007, "角色权限不足"),
    LOCK_STOCK_FAILED(1008, "锁定库存失败");

    private final Integer code;
    private final String message;

    ErrorCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
