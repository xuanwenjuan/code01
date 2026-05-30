package com.plastic.injection.po;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cost_accounting")
public class CostAccountingPO extends BasePO {

    private Long orderId;

    private String orderNo;

    private Long productId;

    private String productName;

    private Long categoryId;

    private String categoryName;

    private BigDecimal productionQuantity;

    private BigDecimal materialCost;

    private BigDecimal machineCost;

    private BigDecimal laborCost;

    private BigDecimal defectiveCost;

    private BigDecimal energyCost;

    private BigDecimal maintenanceCost;

    private BigDecimal otherCost;

    private BigDecimal totalCost;

    private BigDecimal unitCost;

    private BigDecimal salesPrice;

    private BigDecimal grossProfit;

    private BigDecimal grossProfitMargin;

    private BigDecimal materialLossRate;

    private BigDecimal defectiveRate;

    private LocalDate accountingDate;

    private String remark;
}
