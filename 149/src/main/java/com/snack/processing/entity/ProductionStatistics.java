package com.snack.processing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_statistics")
public class ProductionStatistics extends BaseEntity {

    private LocalDate statisticsDate;
    private Integer statisticsType;
    private Integer workOrderCount;
    private Integer completedOrderCount;
    private BigDecimal totalOutputQuantity;
    private BigDecimal totalDefectiveQuantity;
    private BigDecimal totalInputQuantity;
    private BigDecimal totalWasteQuantity;
    private BigDecimal defectiveRate;
    private BigDecimal yieldRate;
    private BigDecimal materialUtilizationRate;
    private BigDecimal totalMaterialCost;
    private BigDecimal totalEnergyCost;
    private BigDecimal totalLaborCost;
    private BigDecimal totalPackagingCost;
    private BigDecimal totalCost;
    private BigDecimal unitCost;
    private BigDecimal unitMaterialCost;
    private BigDecimal unitEnergyCost;
    private BigDecimal unitLaborCost;
    private BigDecimal unitPackagingCost;
    private BigDecimal materialWasteCost;
    private BigDecimal processWasteCost;
    private BigDecimal totalWasteCost;
    private BigDecimal totalLaborHours;
    private BigDecimal totalEnergyConsumption;
    private String remark;
}
