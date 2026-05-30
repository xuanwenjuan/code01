package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_report")
public class ProductionReport extends BaseEntity {

    private String reportNo;

    private Long orderId;

    private String orderNo;

    private Long processId;

    private Integer processNo;

    private String processName;

    private Long workstationId;

    private String workstationName;

    private Long equipmentId;

    private String equipmentName;

    private Long operatorId;

    private String operatorName;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private BigDecimal workHours;

    private BigDecimal planQuantity;

    private BigDecimal actualQuantity;

    private BigDecimal goodQuantity;

    private BigDecimal badQuantity;

    private String badReason;

    private Integer status;

    private String auditor;

    private LocalDateTime auditTime;

    private String remark;
}
