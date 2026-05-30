package com.camping.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderCostDetailVO {

    private Long orderId;

    private String orderNo;

    private String groupName;

    private BigDecimal totalSales;

    private BigDecimal materialCost;

    private BigDecimal materialLossAmount;

    private BigDecimal processingCost;

    private BigDecimal shippingCost;

    private BigDecimal operationCost;

    private BigDecimal totalCost;

    private BigDecimal grossProfit;

    private BigDecimal grossProfitRate;

    private Integer orderStatus;

    private String orderStatusName;

    private List<MaterialLossItem> lossItems;

    private LocalDateTime createTime;

    private LocalDateTime completeTime;

    @Data
    public static class MaterialLossItem {
        private Long materialId;
        private String materialName;
        private BigDecimal lossQuantity;
        private String lossType;
        private String lossReason;
        private BigDecimal unitPrice;
        private BigDecimal totalAmount;
    }
}
