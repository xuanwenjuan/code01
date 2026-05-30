package com.horncomb.entity;

import com.horncomb.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
public class ProfitLedger extends BaseEntity {
    private String ledgerNo;
    private Long categoryId;
    private String statisticalMonth;
    private Integer productionQuantity;
    private Integer salesQuantity;
    private BigDecimal materialCost;
    private BigDecimal consumableCost;
    private BigDecimal laborCost;
    private BigDecimal totalCost;
    private BigDecimal salesRevenue;
    private BigDecimal grossProfit;
    private BigDecimal grossProfitMargin;
    private String remark;
}
