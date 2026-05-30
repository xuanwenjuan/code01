package com.snack.processing.common;

import lombok.Getter;

@Getter
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    FAIL(500, "操作失败"),
    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),
    METHOD_NOT_ALLOWED(405, "请求方法不支持"),
    LOGIN_ERROR(1001, "用户名或密码错误"),
    TOKEN_INVALID(1002, "Token无效或已过期"),
    USER_DISABLED(1003, "用户已被禁用"),
    USER_EXISTS(1004, "用户已存在"),
    USER_NOT_FOUND(1005, "用户不存在"),
    DATA_EXISTS(2001, "数据已存在"),
    DATA_NOT_FOUND(2002, "数据不存在"),
    DATA_IN_USE(2003, "数据正在使用中"),
    DATA_DELETE_NOT_ALLOWED(2004, "数据不允许删除"),
    DATA_UPDATE_NOT_ALLOWED(2005, "数据不允许修改"),
    STOCK_NOT_ENOUGH(3001, "库存不足"),
    STOCK_LOCK_FAILED(3002, "库存锁定失败"),
    STOCK_UNLOCK_FAILED(3003, "库存解锁失败"),
    BATCH_EXISTS(3004, "批次号已存在"),
    BATCH_NOT_FOUND(3005, "批次号不存在"),
    MATERIAL_EXPIRED(3006, "物料已过期"),
    MATERIAL_DISABLED(3007, "物料已禁用"),
    ORDER_STATUS_ERROR(4001, "工单状态错误"),
    ORDER_OPERATION_NOT_ALLOWED(4002, "工单操作不允许"),
    ORDER_PROCESS_FINISHED(4003, "工序已完成"),
    ORDER_PROCESS_NOT_START(4004, "工序未开始"),
    QUALITY_INSPECTION_EXISTS(5001, "质检记录已存在"),
    QUALITY_INSPECTION_NOT_PASS(5002, "质检未通过"),
    PERMISSION_DENIED(6001, "权限不足"),
    PERMISSION_EXPIRED(6002, "权限已过期"),
    FILE_UPLOAD_ERROR(7001, "文件上传失败"),
    FILE_DOWNLOAD_ERROR(7002, "文件下载失败"),
    EXPORT_ERROR(7003, "导出失败"),
    IMPORT_ERROR(7004, "导入失败"),
    SYSTEM_ERROR(9001, "系统异常"),
    DATABASE_ERROR(9002, "数据库操作异常"),
    REDIS_ERROR(9003, "缓存操作异常"),
    EXTERNAL_SERVICE_ERROR(9004, "外部服务调用异常");

    private final Integer code;
    private final String message;

    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
