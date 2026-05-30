package com.motor.core.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("operation_log")
public class OperationLog {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String module;
    private String operationType;
    private String operationDesc;
    private Long businessId;
    private String businessNo;
    private Long operatorId;
    private String operatorName;
    private String ipAddress;
    private String requestParams;
    private LocalDateTime createTime;
}
