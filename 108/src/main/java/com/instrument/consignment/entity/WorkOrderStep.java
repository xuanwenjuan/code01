package com.instrument.consignment.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_step")
public class WorkOrderStep extends BaseEntity {

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

    private String remark;
}
