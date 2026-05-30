package com.fastener.production.entity.system;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("operation_log")
public class OperationLog {

    private Long id;

    private String logNo;

    private Integer operationType;

    private String moduleCode;

    private String moduleName;

    private Long businessId;

    private String businessNo;

    private Long operatorId;

    private String operatorName;

    private LocalDateTime operationTime;

    private String ipAddress;

    private String userAgent;

    private String requestUrl;

    private String requestMethod;

    private String requestParams;

    private String responseResult;

    private Long costTime;

    private Integer status;

    private String errorMsg;

    private String remark;
}
