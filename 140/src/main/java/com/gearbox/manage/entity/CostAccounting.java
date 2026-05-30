package com.gearbox.manage.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cost_accounting")
public class CostAccounting extends BaseEntity {
    private Long workOrderId;
    private String orderNo;
    private BigDecimal materialCost;
    private BigDecimal toolCost;
    private BigDecimal machineCost;
    private BigDecimal laborCost;
    private BigDecimal scrapCost;
    private BigDecimal totalCost;
    private BigDecimal unitCost;
    private Integer quantity;
    private Integer qualifiedQuantity;
    private Integer scrapQuantity;
    private LocalDate accountingDate;
    private String status;
    private String remark;
}
