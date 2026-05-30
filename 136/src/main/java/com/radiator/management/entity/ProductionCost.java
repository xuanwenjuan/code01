package com.radiator.management.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("production_cost")
public class ProductionCost {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long workOrderId;

    private BigDecimal materialCost;

    private BigDecimal equipmentCost;

    private BigDecimal laborCost;

    private BigDecimal consumableCost;

    private BigDecimal scrapCost;

    private BigDecimal totalCost;

    private String month;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}