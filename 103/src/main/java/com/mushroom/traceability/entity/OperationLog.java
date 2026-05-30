package com.mushroom.traceability.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("operation_log")
public class OperationLog extends BaseEntity {
    private String bizType;

    private Long bizId;

    private String operationType;

    private String operationContent;

    private Long operatorId;

    private String operatorName;

    private String operatorRole;

    private String ipAddress;

    private LocalDateTime createTime;
}