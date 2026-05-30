package com.cosmetics.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("work_order")
public class WorkOrder {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;

    private Long productId;

    private Long formulaId;

    private BigDecimal planQuantity;

    private BigDecimal actualQuantity;

    private String unit;

    private Integer status;

    private Integer priority;

    private Long leaderId;

    private Long qcId;

    private LocalDate planStartDate;

    private LocalDate planEndDate;

    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    private Integer autoSuspend;

    private Integer isFormulaConfirmed;

    private String remark;

    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
