package com.aromatherapy.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("operation_log")
public class OperationLog {

    private Long id;

    private String module;

    private String operationType;

    private String operationDesc;

    private Long businessId;

    private Long operatorId;

    private String operatorName;

    private String ipAddress;

    private LocalDateTime createTime;
}
