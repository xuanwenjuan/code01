package com.liquor.brewing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.liquor.brewing.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_cost")
public class WorkOrderCost extends BaseEntity {

    private Long workOrderId;

    private BigDecimal materialCost;

    private BigDecimal equipmentCost;

    private BigDecimal utilityCost;

    private BigDecimal laborCost;

    private BigDecimal scrapCost;

    private BigDecimal totalCost;

    private BigDecimal outputQuantity;

    private BigDecimal unitCost;
}
