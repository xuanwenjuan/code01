package com.valve.manufacture.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.valve.manufacture.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_loss")
public class ProductionLoss extends BaseEntity {

    private Long workOrderId;

    private Long processId;

    private String lossType;

    private Long materialId;

    private BigDecimal lossQuantity;

    private BigDecimal unitPrice;

    private BigDecimal lossAmount;

    private Integer scrapCount;

    private BigDecimal scrapCost;

    private BigDecimal toolWearCost;

    private BigDecimal energyCost;

    private Long operatorId;

    private LocalDateTime lossTime;

    private String remark;
}
