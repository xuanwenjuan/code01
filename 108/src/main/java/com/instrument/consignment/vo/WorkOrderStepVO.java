package com.instrument.consignment.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class WorkOrderStepVO {

    private Long id;

    private Long workOrderId;

    private String stepType;

    private String stepName;

    private String stepDesc;

    private Long operatorId;

    private String operatorName;

    private LocalDateTime operateTime;

    private BigDecimal materialCost;

    private BigDecimal laborHours;

    private BigDecimal laborCost;

    private Integer status;

    private String statusDesc;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
