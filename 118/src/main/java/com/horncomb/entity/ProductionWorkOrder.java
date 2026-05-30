package com.horncomb.entity;

import com.horncomb.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
public class ProductionWorkOrder extends BaseEntity {
    private String orderNo;
    private Long categoryId;
    private Long materialId;
    private String materialBatchNo;
    private Integer productionQuantity;
    private BigDecimal materialUsage;
    private Integer lockQuantity;
    private Long craftsmanId;
    private String status;
    private LocalDateTime cutStartTime;
    private LocalDateTime cutEndTime;
    private LocalDateTime grindStartTime;
    private LocalDateTime grindEndTime;
    private LocalDateTime carveStartTime;
    private LocalDateTime carveEndTime;
    private LocalDateTime polishStartTime;
    private LocalDateTime polishEndTime;
    private LocalDateTime trimStartTime;
    private LocalDateTime trimEndTime;
    private LocalDateTime inspectStartTime;
    private LocalDateTime inspectEndTime;
    private Integer passQuantity;
    private Integer failQuantity;
    private BigDecimal workHours;
    private BigDecimal hourlyWage;
    private BigDecimal totalLaborCost;
    private BigDecimal materialCost;
    private BigDecimal consumableCost;
    private BigDecimal materialWastageCost;
    private BigDecimal processWastageCost;
    private BigDecimal totalCost;
    private BigDecimal unitCost;
    private String remark;
}
