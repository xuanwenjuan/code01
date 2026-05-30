package com.spring.manufacturing.common;

import lombok.Getter;

@Getter
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    ERROR(500, "操作失败"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未登录或登录已过期"),
    FORBIDDEN(403, "权限不足，无法访问"),
    NOT_FOUND(404, "请求资源不存在"),
    PARAM_VALID_ERROR(1001, "参数校验失败"),
    USER_NOT_EXIST(1002, "用户不存在"),
    USER_DISABLED(1003, "用户已被禁用"),
    PASSWORD_ERROR(1004, "密码错误"),
    CATEGORY_OFFLINE(2001, "该产品型号已下线，无法创建工单"),
    MATERIAL_INSUFFICIENT(2002, "原料库存不足"),
    MATERIAL_LOCKED(2003, "原料已被锁定，请稍后重试"),
    WORK_ORDER_NOT_EXIST(2004, "工单不存在"),
    WORK_ORDER_FINISHED(2005, "工单已完成，无法修改"),
    WORK_ORDER_PAUSED(2006, "工单已暂停，无法操作"),
    PROCESS_NOT_STARTED(2007, "工序未开始，无法完成"),
    PREV_PROCESS_NOT_FINISHED(2008, "上道工序未完成，无法开始当前工序"),
    DATABASE_ERROR(3001, "数据库操作异常"),
    REDIS_ERROR(3002, "缓存操作异常"),
    FILE_UPLOAD_ERROR(4001, "文件上传失败");

    private final Integer code;
    private final String message;

    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}