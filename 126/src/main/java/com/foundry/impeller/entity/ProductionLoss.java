package com.foundry.impeller.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_loss")
public class ProductionLoss extends BaseEntity {

    private Long workOrderId;

    private String lossType;

    private Long materialId;

    private String materialName;

    private BigDecimal lossQuantity;

    private String unit;

    private BigDecimal unitPrice;

    private BigDecimal totalCost;

    private String lossReason;

    private String remark;
}
