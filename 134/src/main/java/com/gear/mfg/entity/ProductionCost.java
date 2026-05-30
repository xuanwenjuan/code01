package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_cost")
public class ProductionCost extends BaseEntity {

    private Long orderId;

    private String orderNo;

    private String gearModel;

    private BigDecimal quantity;

    private BigDecimal materialCost;

    private BigDecimal toolCost;

    private BigDecimal energyCost;

    private BigDecimal laborCost;

    private BigDecimal scrapCost;

    private BigDecimal totalCost;

    private BigDecimal unitCost;

    private String settlementStatus;

    private String remark;
}