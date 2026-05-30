package com.bee.equipment.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order")
public class WorkOrder extends BaseEntity {

    private String orderNo;

    private Long equipmentCategoryId;

    private Integer quantity;

    private String status;

    private Long assemblerId;

    private LocalDateTime pickTime;

    private LocalDateTime finishTime;

    private LocalDateTime deadline;

    private String remark;

    @TableField(exist = false)
    private List<WorkOrderMaterial> materials;
}
