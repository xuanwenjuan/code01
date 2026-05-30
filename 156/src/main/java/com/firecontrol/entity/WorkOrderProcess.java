package com.firecontrol.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_process")
public class WorkOrderProcess extends BaseEntity {

    private Long workOrderId;

    private String orderNo;

    private String processCode;

    private String processName;

    private Integer processSort;

    private Integer status;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Long operatorId;

    private String operatorName;

    private String operationContent;

    private String inspectionResult;

    private String remark;
}
