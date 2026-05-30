package com.snack.processing.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order")
public class WorkOrder extends BaseEntity {

    private String orderNo;
    private Long snackCategoryId;
    private String snackCategoryName;
    private String productName;
    private BigDecimal planQuantity;
    private BigDecimal actualQuantity;
    private String unit;
    private LocalDateTime planStartTime;
    private LocalDateTime planEndTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private String currentProcess;
    private String processOrder;
    private Integer status;
    private Integer priority;
    private Long processEnginnerId;
    private String processEnginnerName;
    private Long productionLeaderId;
    private String productionLeaderName;
    private Long qcInspectorId;
    private String qcInspectorName;
    private Integer isOverdue;
    private BigDecimal totalCost;
    private String remark;

    @TableField(exist = false)
    private List<WorkOrderProcess> processes;

    @TableField(exist = false)
    private List<WorkOrderMaterial> materials;
}
