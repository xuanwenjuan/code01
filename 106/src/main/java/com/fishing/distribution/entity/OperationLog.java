package com.fishing.distribution.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("operation_log")
public class OperationLog extends BaseEntity {

    private String operationModule;

    private String operationType;

    private String operationDesc;

    private Long businessId;

    private String businessNo;

    private Long operatorId;

    private String operatorName;

    private String operatorRole;

    private String ipAddress;

    private String requestParams;

    private String responseResult;

    private Integer status;

    private String errorMsg;

    private LocalDateTime operationTime;

    private Long costTime;
}
