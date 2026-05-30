package com.liquor.brewing.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.liquor.brewing.common.BaseEntity;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

    @NotBlank(message = "工单名称不能为空")
    private String orderName;

    @NotNull(message = "配方不能为空")
    private Long formulaId;

    @NotNull(message = "分类不能为空")
    private Long categoryId;

    @NotNull(message = "计划产量不能为空")
    @DecimalMin(value = "0.01", message = "计划产量必须大于0")
    private BigDecimal planQuantity;

    private BigDecimal actualQuantity;

    @NotBlank(message = "单位不能为空")
    private String unit;

    private Integer priority;

    private Integer status;

    private Long brewerId;

    private Long supervisorId;

    private Long inspectorId;

    private LocalDate planStartDate;

    private LocalDate planEndDate;

    private LocalDateTime actualStartTime;

    private LocalDateTime actualEndTime;

    private String remark;

    @TableField(exist = false)
    private String formulaName;

    @TableField(exist = false)
    private String categoryName;

    @TableField(exist = false)
    private String brewerName;

    @TableField(exist = false)
    private String supervisorName;

    @TableField(exist = false)
    private String inspectorName;

    @TableField(exist = false)
    private List<WorkOrderMaterial> materials;

    @TableField(exist = false)
    private List<WorkOrderProcess> processes;
}
