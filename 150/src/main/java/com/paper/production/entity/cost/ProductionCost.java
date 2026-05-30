package com.paper.production.entity.cost;

import com.baomidou.mybatisplus.annotation.TableName;
import com.paper.production.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_cost")
public class ProductionCost extends BaseEntity {

    private Long workOrderId;
    private String orderNo;
    private String orderName;
    private BigDecimal materialCost;
    private BigDecimal equipmentCost;
    private BigDecimal utilityCost;
    private BigDecimal laborCost;
    private BigDecimal scrapCost;
    private BigDecimal totalCost;
    private BigDecimal outputQuantity;
    private BigDecimal unitCost;
    private LocalDate costDate;
    private String period;
    private Integer status;
    private String remark;
}
