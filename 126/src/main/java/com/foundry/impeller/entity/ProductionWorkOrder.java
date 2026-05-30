package com.foundry.impeller.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_work_order")
public class ProductionWorkOrder extends BaseEntity {

    private String workOrderNo;

    @NotNull(message = "产品分类ID不能为空")
    private Long productCategoryId;

    @NotBlank(message = "产品名称不能为空")
    private String productName;

    @NotNull(message = "计划产量不能为空")
    @Positive(message = "计划产量必须大于0")
    private Integer plannedQuantity;

    private Integer actualQuantity;

    private Integer defectiveQuantity;

    private String status;

    @NotNull(message = "计划开始时间不能为空")
    private LocalDateTime planStartTime;

    private LocalDateTime actualStartTime;

    private LocalDateTime finishTime;

    @NotNull(message = "工艺员不能为空")
    private Long processUserId;

    @NotNull(message = "班组长不能为空")
    private Long teamLeaderId;

    @NotNull(message = "巡检员不能为空")
    private Long inspectorId;

    private String remark;

    @TableField(exist = false)
    private List<WorkOrderMaterial> materials;

    @TableField(exist = false)
    private List<ProductionLog> logs;
}
