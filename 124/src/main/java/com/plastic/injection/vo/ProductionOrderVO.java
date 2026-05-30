package com.plastic.injection.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductionOrderVO {

    private Long id;

    private String orderNo;

    private Long productId;

    private String productName;

    private Long categoryId;

    private String categoryName;

    private BigDecimal planQuantity;

    private BigDecimal actualQuantity;

    private BigDecimal defectiveQuantity;

    private Integer orderStatus;

    private String orderStatusDesc;

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

    private BigDecimal totalCost;

    private String remark;

    private Integer isDelayed;

    private LocalDateTime delayTime;

    private List<OrderMaterialVO> materials;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
