package com.flange.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("production_log")
public class ProductionLog {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private String orderNo;

    private String processStep;

    private Long operatorId;

    private String operatorName;

    private String operationType;

    private LocalDateTime operationTime;

    private Integer quantity;

    private Integer qualifiedQuantity;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
