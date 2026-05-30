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
@TableName("work_order")
public class WorkOrder extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String workOrderNo;

    private Long productId;

    private String productName;

    private Integer planQuantity;

    private Integer actualQuantity;

    private Integer priority;

    private Integer status;

    private String currentProcess;

    private Integer processProgress;

    private LocalDateTime planStartTime;

    private LocalDateTime planEndTime;

    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    private BigDecimal totalHours;

    private Long lineLeaderId;

    private String lineLeaderName;

    private String remark;

    private Integer isFrozen;

    private String frozenReason;

    private LocalDateTime frozenTime;

    private String auditRemark;

    private LocalDateTime auditTime;

    private Long categoryId;
}
