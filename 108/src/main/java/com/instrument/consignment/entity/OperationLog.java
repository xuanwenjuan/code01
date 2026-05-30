package com.instrument.consignment.entity;

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

    private String operationDesc;

    private String beforeContent;

    private String afterContent;

    private Long operatorId;

    private String operatorName;

    private String ipAddress;

    private LocalDateTime createTime;
}
