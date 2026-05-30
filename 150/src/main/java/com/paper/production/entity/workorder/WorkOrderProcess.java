package com.paper.production.entity.workorder;

import com.baomidou.mybatisplus.annotation.TableName;
import com.paper.production.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_process")
public class WorkOrderProcess extends BaseEntity {

    private Long workOrderId;
    private String orderNo;
    private Integer processType;
    private String processName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal inputQuantity;
    private BigDecimal outputQuantity;
    private BigDecimal defectiveQuantity;
    private String equipment;
    private String operator;
    private Integer status;
    private String remark;
}
