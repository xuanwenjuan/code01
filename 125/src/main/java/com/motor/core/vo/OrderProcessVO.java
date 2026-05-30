package com.motor.core.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderProcessVO {
    private Long id;

    private Long orderId;

    private String processCode;

    private String processName;

    private Long operatorId;

    private String operatorName;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer processDuration;

    private Integer outputQuantity;

    private Integer defectiveQuantity;

    private BigDecimal materialWaste;

    private BigDecimal energyConsumption;

    private BigDecimal laborHours;

    private Integer status;

    private String statusDesc;

    private String remark;

    private LocalDateTime createTime;
}
