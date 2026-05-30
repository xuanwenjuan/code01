package com.foundry.impeller.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_material")
public class WorkOrderMaterial extends BaseEntity {

    private Long workOrderId;

    private Long materialId;

    private String materialName;

    private BigDecimal usageQuantity;

    private String unit;
}
