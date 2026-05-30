package com.sheetmetal.compressor.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("operation_log")
public class OperationLog {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String logNo;
    private String operationType;
    private String operationModule;
    private String operationDesc;
    private Long businessId;
    private String businessNo;
    private Long operatorId;
    private String operatorName;
    private Integer operatorRole;
    private String ipAddress;
    private String requestParams;
    private String responseResult;
    private LocalDateTime operationTime;
    private Long costTime;
}
