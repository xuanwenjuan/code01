package com.snack.processing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_process")
public class WorkOrderProcess extends BaseEntity {

    private Long workOrderId;
    private String processCode;
    private String processName;
    private Integer sortOrder;
    private Integer status;
    private Long operatorId;
    private String operatorName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long duration;
    private BigDecimal outputQuantity;
    private BigDecimal defectiveQuantity;
    private String equipment;
    private BigDecimal energyConsumption;
    private BigDecimal laborHours;
    private String remark;
}
