package com.valve.manufacture.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("operation_log")
public class OperationLog {

    private Long id;

    private String operationType;

    private String moduleName;

    private Long businessId;

    private String businessNo;

    private Long operatorId;

    private String operatorName;

    private String operationContent;

    private String ipAddress;

    private LocalDateTime createTime;
}
