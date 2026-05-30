package com.snack.processing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_operation_log")
public class SysOperationLog extends BaseEntity {

    private String module;
    private String operation;
    private String description;
    private String method;
    private String requestUrl;
    private String requestMethod;
    private String requestParams;
    private String responseResult;
    private Long userId;
    private String username;
    private String ip;
    private LocalDateTime operationTime;
    private Long costTime;
    private Integer status;
    private String errorMsg;
}
