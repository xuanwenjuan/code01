package com.firecontrol.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_labor")
public class WorkOrderLabor extends BaseEntity {

    private Long workOrderId;

    private String orderNo;

    private String processCode;

    private String processName;

    private Long workerId;

    private String workerName;

    private BigDecimal workHours;

    private BigDecimal hourlyRate;

    private BigDecimal laborCost;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String remark;
}
