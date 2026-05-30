package com.mining.maintenance.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("operation_log")
public class OperationLog extends BaseEntity {

    private Long userId;

    private String username;

    private String realName;

    private String role;

    private String operationModule;

    private String operationType;

    private String operationDesc;

    private String methodName;

    private String requestParams;

    private String ipAddress;

    private Integer duration;

    private Integer status;

    private String errorMsg;

    private LocalDateTime operationTime;
}