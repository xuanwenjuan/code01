package com.mining.maintenance.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("maintenance_order")
public class MaintenanceOrder extends BaseEntity {

    private String orderNo;

    private Long equipmentId;

    private String equipmentCode;

    private String miningArea;

    private String faultLevel;

    private String faultDescription;

    private Long reportUserId;

    private LocalDateTime reportTime;

    private Long assignedTechnicianId;

    private LocalDateTime assignedTime;

    private LocalDateTime acceptTime;

    private LocalDateTime startTime;

    private LocalDateTime completeTime;

    private Integer acceptFlag;

    private Integer reassignCount;

    private String status;

    private String maintenanceContent;

    private String partsUsed;

    private BigDecimal laborHours;

    private Long checkerId;

    private LocalDateTime checkTime;

    private String checkOpinion;
}