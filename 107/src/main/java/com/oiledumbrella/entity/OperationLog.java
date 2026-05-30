package com.oiledumbrella.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("operation_log")
public class OperationLog extends BaseEntity {
    private Long userId;
    private String userName;
    private String operationType;
    private String businessType;
    private Long businessId;
    private String businessNo;
    private String description;
    private String requestParams;
    private String responseResult;
    private String ipAddress;
    private Integer status;
    private String errorMsg;
    private LocalDateTime operationTime;
}
