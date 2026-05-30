package com.gearbox.manage.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order")
public class WorkOrder extends BaseEntity {
    private String orderNo;
    private Long categoryId;
    private String productName;
    private Integer quantity;
    private Integer priority;
    private String status;
    private LocalDate planStartDate;
    private LocalDate planEndDate;
    private LocalDateTime actualStartDate;
    private LocalDateTime actualEndDate;
    private BigDecimal totalHours;
    private Long teamLeaderId;
    private String remark;

    @TableField(exist = false)
    private List<WorkOrderMaterial> materials;

    @TableField(exist = false)
    private List<WorkProcess> processes;

    @TableField(exist = false)
    private List<QualityInspection> inspections;
}
