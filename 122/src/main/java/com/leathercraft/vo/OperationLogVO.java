package com.leathercraft.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OperationLogVO {
    private Long id;
    private Long userId;
    private String username;
    private String operationModule;
    private String operationType;
    private String operationDesc;
    private String requestUrl;
    private String requestMethod;
    private String requestParams;
    private String ipAddress;
    private LocalDateTime operationTime;
    private Long costTime;
}
