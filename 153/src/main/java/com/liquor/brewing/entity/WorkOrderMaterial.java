package com.liquor.brewing.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.liquor.brewing.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_material")
public class WorkOrderMaterial extends BaseEntity {

    private Long workOrderId;

    private Long materialId;

    private Long batchId;

    private BigDecimal planQuantity;

    private BigDecimal actualQuantity;

    private String unit;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;

    @TableField(exist = false)
    private String materialName;

    @TableField(exist = false)
    private String materialCode;

    @TableField(exist = false)
    private String batchCode;
}
