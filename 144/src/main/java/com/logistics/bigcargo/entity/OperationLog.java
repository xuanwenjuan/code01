package com.logistics.bigcargo.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("sys_operation_log")
public class OperationLog {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String operationType;

    private String businessNo;

    private String businessType;

    private Long operatorId;

    private String operatorName;

    private String operationContent;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    private Integer deleted;
}
