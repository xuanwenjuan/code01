package com.bee.equipment.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("work_order_material")
public class WorkOrderMaterial {

    private Long id;

    private Long workOrderId;

    private Long materialId;

    private BigDecimal requiredQuantity;

    private BigDecimal actualQuantity;

    private LocalDateTime createTime;
}
