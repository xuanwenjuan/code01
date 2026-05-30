package com.plastic.injection.po;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_order")
public class ProductionOrderPO extends BasePO {

    private String orderNo;

    private Long productId;

    private String productName;

    private Long categoryId;

    private String categoryName;

    private BigDecimal planQuantity;

    private BigDecimal actualQuantity;

    private BigDecimal defectiveQuantity;

    private Integer orderStatus;

    private LocalDateTime planStartTime;

    private LocalDateTime planEndTime;

    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    private Long technicianId;

    private String technicianName;

    private Long machineId;

    private String machineName;

    private Integer dryingTime;

    private Integer moldInstallTime;

    private Integer injectionCycle;

    private Integer coolingTime;

    private Integer trimmingTime;

    private BigDecimal materialCost;

    private BigDecimal machineCost;

    private BigDecimal laborCost;

    private BigDecimal defectiveCost;

    private BigDecimal energyCost;

    private BigDecimal maintenanceCost;

    private BigDecimal otherCost;

    private BigDecimal totalCost;

    private String remark;

    private Integer isDelayed;

    private LocalDateTime delayTime;

    private Integer isLocked;

    private LocalDateTime lockTime;
}
