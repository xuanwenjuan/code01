package com.fitness.manufacture.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fitness.manufacture.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cost_statistics")
public class CostStatistics extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long workOrderId;

    private String workOrderNo;

    private Long productId;

    private String productName;

    private BigDecimal metalMaterialCost;

    private BigDecimal plasticMaterialCost;

    private BigDecimal electronicMaterialCost;

    private BigDecimal auxiliaryMaterialCost;

    private BigDecimal materialCost;

    private BigDecimal weldingRodCost;

    private BigDecimal weldingGasCost;

    private BigDecimal weldingCost;

    private BigDecimal cuttingLaborCost;

    private BigDecimal assemblyLaborCost;

    private BigDecimal grindingLaborCost;

    private BigDecimal qcLaborCost;

    private BigDecimal laborCost;

    private BigDecimal cuttingMachineCost;

    private BigDecimal weldingMachineCost;

    private BigDecimal assemblyMachineCost;

    private BigDecimal electricityCost;

    private BigDecimal equipmentCost;

    private BigDecimal materialScrapCost;

    private BigDecimal reworkCost;

    private BigDecimal scrapCost;

    private BigDecimal totalCost;

    private BigDecimal unitCost;

    private Integer planQuantity;

    private Integer actualQuantity;

    private Integer scrapQuantity;

    private Integer qualifiedQuantity;

    private BigDecimal passRate;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDate statisticsDate;

    private String remark;
}
