package com.instrument.consignment.po;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("refurbish_work_order")
public class RefurbishWorkOrderPO {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String workOrderNo;

    private Long archiveId;

    private String traceNo;

    private String customerName;

    private String customerPhone;

    private String receiveType;

    private String receiveAddress;

    private LocalDateTime receiveTime;

    private Long receiveUserId;

    private Long estimatorId;

    private LocalDateTime estimateTime;

    private String estimateRemark;

    private Long craftsmanId;

    private String status;

    private LocalDateTime statusConfirmTime;

    private Integer isTimeoutReminded;

    private BigDecimal actualMaterialCost;

    private BigDecimal actualLaborCost;

    private BigDecimal totalRefurbishCost;

    private LocalDateTime completeTime;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer isDeleted;
}
