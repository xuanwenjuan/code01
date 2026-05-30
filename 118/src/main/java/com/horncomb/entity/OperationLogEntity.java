package com.horncomb.entity;

import com.horncomb.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class OperationLogEntity extends BaseEntity {
    private Long userId;
    private String username;
    private String operationModule;
    private String operationType;
    private String operationDesc;
    private String requestMethod;
    private String requestUrl;
    private String requestParams;
    private String responseResult;
    private String ipAddress;
    private Long executeTime;
}
