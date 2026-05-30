package com.fan.impeller.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_cost")
public class ProductionCost extends BaseEntity {
    private Long workOrderId;
    private String workOrderNo;
    private BigDecimal materialCost;
    private BigDecimal moldCost;
    private BigDecimal energyCost;
    private BigDecimal laborCost;
    private BigDecimal scrapCost;
    private BigDecimal totalCost;
    private BigDecimal unitCost;
    private BigDecimal quantity;
    private String reportDate;
    private String remark;
}
