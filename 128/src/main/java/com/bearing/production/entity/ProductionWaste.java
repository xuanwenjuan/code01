package com.bearing.production.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_waste")
public class ProductionWaste extends BaseEntity {

    private Long workOrderId;

    private String orderNo;

    private Long categoryId;

    private String categoryName;

    private Long materialId;

    private String materialName;

    private BigDecimal materialWaste;

    private BigDecimal equipmentWear;

    private BigDecimal energyCost;

    private BigDecimal laborCost;

    private BigDecimal defectiveQuantity;

    private BigDecimal defectiveLoss;

    private BigDecimal totalCost;

    private BigDecimal unitCost;

    private BigDecimal productionQuantity;

    private BigDecimal qualifiedQuantity;

    private BigDecimal yieldRate;

    private String qualityInspector;

    private LocalDateTime calculationTime;

    private String remark;
}
