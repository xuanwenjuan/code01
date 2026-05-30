package com.construction.embedded.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("cost_accounting")
public class CostAccounting {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String accountingNo;

    private Long categoryId;

    private String accountingMonth;

    private BigDecimal materialCost;

    private BigDecimal equipmentLoss;

    private BigDecimal coatingCost;

    private BigDecimal laborCost;

    private BigDecimal scrapLoss;

    private BigDecimal totalCost;

    private Integer productionQuantity;

    private BigDecimal unitCost;

    private String status;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
