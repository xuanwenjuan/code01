package com.instrument.consignment.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("refurbish_work_order")
public class RefurbishWorkOrder extends BaseEntity {

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

    @TableField(exist = false)
    private List<WorkOrderStep> steps;
}
