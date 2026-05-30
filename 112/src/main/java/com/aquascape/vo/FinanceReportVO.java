package com.aquascape.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Data
public class FinanceReportVO {
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalPurchase;
    private BigDecimal totalIncome;
    private BigDecimal totalLoss;
    private BigDecimal profit;
    private BigDecimal profitRate;
    private Map<String, BigDecimal> categoryPurchase;
    private Integer recordCount;
}
