package com.naturaldye.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.naturaldye.enums.WorkOrderStatusEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("dye_work_order")
public class DyeWorkOrder extends BaseEntity {

    private String orderNo;

    @NotNull(message = "色系类目不能为空")
    private Long categoryId;

    @NotBlank(message = "面料名称不能为空")
    private String fabricName;

    private BigDecimal fabricQuantity;

    private Long assignedUserId;

    private WorkOrderStatusEnum status;

    private LocalDateTime feedingTime;

    private LocalDateTime preprocessFinishTime;

    private LocalDateTime boilingFinishTime;

    private LocalDateTime dyeingFinishTime;

    private LocalDateTime fixingFinishTime;

    private LocalDateTime dryingFinishTime;

    private LocalDateTime cuttingFinishTime;

    private LocalDateTime completedTime;

    private String remarks;

    @TableField(exist = false)
    private List<WorkOrderMaterial> materials;
}
