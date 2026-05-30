package com.instrument.consignment.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OperationLogVO {

    private Long id;

    private String bizType;

    private String bizTypeDesc;

    private Long bizId;

    private String operationType;

    private String operationTypeDesc;

    private String operationDesc;

    private String beforeContent;

    private String afterContent;

    private Long operatorId;

    private String operatorName;

    private String ipAddress;

    private LocalDateTime createTime;
}
