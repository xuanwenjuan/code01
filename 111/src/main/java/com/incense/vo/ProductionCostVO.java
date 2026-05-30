package com.incense.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductionCostVO {
    private Long id;
    private Long orderId;
    private String orderNo;
    private Long categoryId;
    private String categoryName;
    private BigDecimal targetQuantity;
    private BigDecimal actualQuantity;
    private BigDecimal materialCost;
    private BigDecimal processCost;
    private BigDecimal lossCost;
    private BigDecimal totalCost;
    private BigDecimal unitCost;
    private String costDetail;
    private Long operatorId;
    private String operatorName;
    private LocalDateTime createTime;

    private List<ProductionLossVO> lossDetails;
}
