package com.watchrepair.admin.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("repair_work_order")
public class RepairWorkOrder extends BaseEntity {

    private String orderNo;

    private Long categoryId;

    private String watchModel;

    private String customerName;

    private String customerPhone;

    private String faultDescription;

    private Integer status;

    private Long technicianId;

    private Long partsSelectorId;

    private LocalDateTime receivedTime;

    private LocalDateTime disassembleTime;

    private LocalDateTime partsReplaceTime;

    private LocalDateTime adjustTime;

    private LocalDateTime polishTime;

    private LocalDateTime completedTime;

    private BigDecimal partsCost;

    private BigDecimal laborCost;

    private BigDecimal appearanceCost;

    private BigDecimal lossCost;

    private BigDecimal totalAmount;

    private String inspectionReport;

    private String remarks;

    @TableField(exist = false)
    private String statusDesc;

    @TableField(exist = false)
    private String technicianName;

    @TableField(exist = false)
    private String partsSelectorName;

    @TableField(exist = false)
    private List<WorkOrderPart> workOrderParts;
}