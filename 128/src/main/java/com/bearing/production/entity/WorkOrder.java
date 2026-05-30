package com.bearing.production.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order")
public class WorkOrder extends BaseEntity {
    private String orderNo;
    private Long categoryId;
    private String categoryName;
    private BigDecimal quantity;
    private BigDecimal productionQuantity;
    private BigDecimal qualifiedQuantity;
    private Integer status;
    private LocalDateTime planStartTime;
    private LocalDateTime planEndTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private Long materialId;
    private String materialName;
    private BigDecimal materialQuantity;
    private BigDecimal materialUsage;
    private BigDecimal equipmentLoss;
    private BigDecimal energyCost;
    private BigDecimal laborHours;
    private BigDecimal laborCost;
    private BigDecimal defectiveQuantity;
    private BigDecimal defectiveLoss;
    private BigDecimal totalCost;
    private BigDecimal unitCost;
    private BigDecimal yieldRate;
    private String processEngineer;
    private String lineLeader;
    private String qualityInspector;
    private String remark;
}
