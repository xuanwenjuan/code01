package com.spring.manufacturing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_process")
public class WorkOrderProcess extends BaseEntity {

    private Long workOrderId;

    private String processCode;

    private String processName;

    private Integer processOrder;

    private Long operatorId;

    private String operatorName;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer processQuantity;

    private Integer defectiveQuantity;

    private String status;

    private String processParams;

    private String remark;
}