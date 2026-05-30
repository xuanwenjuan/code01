package com.mining.maintenance.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("maintenance_cost")
public class MaintenanceCost extends BaseEntity {

    private Long orderId;

    private String orderNo;

    private Long equipmentId;

    private String equipmentCode;

    private Long categoryId;

    private String miningArea;

    private Long technicianId;

    private String technicianName;

    private BigDecimal partsCost;

    private BigDecimal laborCost;

    private BigDecimal downtimeLoss;

    private BigDecimal totalCost;

    private LocalDate maintenanceDate;

    private Integer faultDurationHours;

    private String remarks;
}