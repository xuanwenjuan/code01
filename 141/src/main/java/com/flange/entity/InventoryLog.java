package com.flange.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("inventory_log")
public class InventoryLog {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long materialId;

    private String batchNo;

    private String operationType;

    private BigDecimal beforeQuantity;

    private BigDecimal operationQuantity;

    private BigDecimal afterQuantity;

    private Long operatorId;

    private String operatorName;

    private String remark;

    private Long relatedOrderId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
