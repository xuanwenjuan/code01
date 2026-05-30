package com.motor.core.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductionOrderVO {
    private Long id;

    private String orderNo;

    private Long categoryId;

    private String categoryName;

    private String productName;

    private Integer planQuantity;

    private Integer actualQuantity;

    private Long materialId;

    private String materialName;

    private String batchCode;

    private BigDecimal materialUsage;

    private Integer status;

    private String statusDesc;

    private Integer priority;

    private String priorityDesc;

    private LocalDate planStartDate;

    private LocalDate planEndDate;

    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    private Long processLeaderId;

    private String processLeaderName;

    private BigDecimal materialWaste;

    private BigDecimal energyConsumption;

    private BigDecimal laborHours;

    private Integer defectiveQuantity;

    private BigDecimal totalCost;

    private String remark;

    private List<OrderProcessVO> processes;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
