package com.hardware.stamping.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CostAccountingVO {
    private Long id;
    private LocalDate accountingDate;
    private Long categoryId;
    private String categoryName;
    private Long orderId;
    private String orderNo;
    private BigDecimal materialCost;
    private BigDecimal materialLossCost;
    private BigDecimal moldWearCost;
    private BigDecimal laborCost;
    private BigDecimal outsourcingCost;
    private BigDecimal otherCost;
    private BigDecimal totalCost;
    private BigDecimal productionQuantity;
    private BigDecimal unitCost;
    private BigDecimal revenue;
    private BigDecimal profit;
    private BigDecimal profitMargin;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
