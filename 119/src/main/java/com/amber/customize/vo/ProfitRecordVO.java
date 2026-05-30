package com.amber.customize.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProfitRecordVO {

    private Long id;

    private Long orderId;

    private String orderNo;

    private Long categoryId;

    private String categoryName;

    private BigDecimal rawCost;

    private BigDecimal materialCost;

    private BigDecimal laborCost;

    private BigDecimal totalCost;

    private BigDecimal orderPrice;

    private BigDecimal profit;

    private BigDecimal profitRate;

    private LocalDateTime createTime;

}
