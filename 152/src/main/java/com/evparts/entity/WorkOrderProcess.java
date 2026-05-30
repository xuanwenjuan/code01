package com.evparts.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("work_order_process")
public class WorkOrderProcess {

    private Long id;
    private Long workOrderId;
    private String processCode;
    private String processName;
    private String processType;
    private Integer sortOrder;
    private String processStatus;
    private Long operatorId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer qualifiedQuantity;
    private Integer badQuantity;
    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;

    @TableField(exist = false)
    private String operatorName;

}
