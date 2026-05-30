package com.fitness.manufacture.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fitness.manufacture.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_process")
public class WorkOrderProcess extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long workOrderId;

    private String processCode;

    private String processName;

    private Integer processOrder;

    private Integer status;

    private Long operatorId;

    private String operatorName;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private BigDecimal hoursUsed;

    private String qualityCheckResult;

    private Long qualityCheckBy;

    private LocalDateTime qualityCheckTime;

    private String qualityIssue;

    private String remark;
}
