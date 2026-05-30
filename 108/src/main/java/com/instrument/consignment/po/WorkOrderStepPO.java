package com.instrument.consignment.po;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("work_order_step")
public class WorkOrderStepPO {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long workOrderId;

    private String stepType;

    private String stepName;

    private String stepDesc;

    private Long operatorId;

    private String operatorName;

    private LocalDateTime operateTime;

    private BigDecimal materialCost;

    private BigDecimal laborHours;

    private BigDecimal laborCost;

    private Integer status;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer isDeleted;
}
