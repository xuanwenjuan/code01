package com.leathercraft.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ProfitLedgerVO {
    private Long id;
    private String ledgerNo;
    private Long productCategoryId;
    private String productCategoryName;
    private Integer quantity;
    private BigDecimal leatherCost;
    private BigDecimal materialCost;
    private BigDecimal laborCost;
    private BigDecimal lossCost;
    private BigDecimal totalCost;
    private BigDecimal sellingPrice;
    private BigDecimal profit;
    private BigDecimal profitRate;
    private LocalDate statDate;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
