package com.valve.manufacture.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.valve.manufacture.common.BaseEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order")
public class WorkOrder extends BaseEntity {

    private String orderNo;

    @NotNull(message = "产品分类ID不能为空")
    private Long productCategoryId;

    @NotBlank(message = "产品名称不能为空")
    private String productName;

    @NotNull(message = "生产数量不能为空")
    private Integer quantity;

    private Integer priority;

    private String status;

    private LocalDate planStartDate;

    private LocalDate planEndDate;

    private LocalDateTime actualStartDate;

    private LocalDateTime actualEndDate;

    private Long assigneeId;

    private String remark;

    @TableField(exist = false)
    private List<WorkOrderProcess> processes;

    @TableField(exist = false)
    private List<WorkOrderMaterial> materials;
}
