package com.cosmetics.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("work_order_material")
public class WorkOrderMaterial {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long workOrderId;

    private Long materialId;

    private Long materialBatchId;

    private BigDecimal planQuantity;

    private BigDecimal actualQuantity;

    private String unit;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
