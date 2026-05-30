package com.liquor.brewing.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.liquor.brewing.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_process")
public class WorkOrderProcess extends BaseEntity {

    private Long workOrderId;

    private Integer processType;

    private String processName;

    private Long operatorId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer duration;

    private String processParams;

    private String processResult;

    private Integer status;

    private String remark;

    @TableField(exist = false)
    private String operatorName;
}
