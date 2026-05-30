package com.radiator.management.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("monthly_report")
public class MonthlyReport {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String reportMonth;

    private BigDecimal totalMaterialCost;

    private BigDecimal totalEquipmentCost;

    private BigDecimal totalLaborCost;

    private BigDecimal totalConsumableCost;

    private BigDecimal totalScrapCost;

    private BigDecimal totalCost;

    private Integer totalProduction;

    private Integer totalDefective;

    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}