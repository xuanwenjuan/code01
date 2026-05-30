package com.construction.embedded.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("production_log")
public class ProductionLog {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private String operationType;

    private String operationContent;

    private String beforeStatus;

    private String afterStatus;

    private Long operatorId;

    private String operatorName;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime operationTime;

    private String ipAddress;

    @TableLogic
    private Integer deleted;
}
