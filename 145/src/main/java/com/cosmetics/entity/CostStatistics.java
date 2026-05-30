package com.cosmetics.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("cost_statistics")
public class CostStatistics {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long workOrderId;

    private BigDecimal materialCost;

    private BigDecimal packagingCost;

    private BigDecimal energyCost;

    private BigDecimal laborCost;

    private BigDecimal scrapCost;

    private BigDecimal totalCost;

    private BigDecimal unitCost;

    private LocalDateTime statisticsTime;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
