package com.bearing.production.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cost_summary")
public class CostSummary extends BaseEntity {
    private Long categoryId;
    private String categoryName;
    private Integer reportYear;
    private Integer reportQuarter;
    private Integer reportMonth;
    private BigDecimal totalMaterialCost;
    private BigDecimal totalEquipmentLoss;
    private BigDecimal totalEnergyCost;
    private BigDecimal totalLaborCost;
    private BigDecimal totalDefectiveLoss;
    private BigDecimal totalCost;
    private BigDecimal totalQuantity;
    private Integer workOrderCount;
}
