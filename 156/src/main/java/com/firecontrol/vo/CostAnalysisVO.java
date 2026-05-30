package com.firecontrol.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class CostAnalysisVO {

    private LocalDate startDate;

    private LocalDate endDate;

    private BigDecimal totalCost;

    private Long totalWorkOrders;

    private BigDecimal totalQuantity;

    private BigDecimal avgCostPerUnit;

    private CostBreakdownVO costBreakdown;

    private List<MonthlyCostVO> monthlyTrend;

    private List<CategoryCostVO> categoryCosts;

    private List<MaterialCostVO> topMaterialCosts;

    @Data
    public static class CostBreakdownVO {
        private BigDecimal materialCost;
        private BigDecimal materialCostRatio;
        private BigDecimal equipmentCost;
        private BigDecimal equipmentCostRatio;
        private BigDecimal energyCost;
        private BigDecimal energyCostRatio;
        private BigDecimal laborCost;
        private BigDecimal laborCostRatio;
        private BigDecimal scrapCost;
        private BigDecimal scrapCostRatio;
    }

    @Data
    public static class MonthlyCostVO {
        private String month;
        private BigDecimal totalCost;
        private Long workOrderCount;
    }

    @Data
    public static class CategoryCostVO {
        private String categoryName;
        private BigDecimal totalCost;
        private BigDecimal ratio;
        private Long workOrderCount;
    }

    @Data
    public static class MaterialCostVO {
        private String materialName;
        private BigDecimal totalCost;
        private BigDecimal totalQuantity;
        private BigDecimal ratio;
    }
}
