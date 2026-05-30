package com.fastener.production.entity.workorder;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fastener.production.common.entity.BaseEntity;
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

    private String processCode;

    private String processName;

    private Integer processStatus;

    private String operator;

    private String workCenter;

    private String machineCode;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private BigDecimal processDuration;

    private Integer inputQuantity;

    private Integer outputQuantity;

    private Integer scrapQuantity;

    private String processParams;

    private String inspectionResult;

    private String remark;
}
