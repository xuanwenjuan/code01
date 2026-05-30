package com.amber.customize.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CustomOrderVO {

    private Long id;

    private String orderNo;

    private Long rawId;

    private String traceCode;

    private Long categoryId;

    private String categoryName;

    private String customerName;

    private String customerPhone;

    private String themeDescription;

    private String drawingUrl;

    private Integer status;

    private String statusDesc;

    private Long carverId;

    private String carverName;

    private BigDecimal carvingHours;

    private BigDecimal materialCost;

    private BigDecimal laborCost;

    private BigDecimal polishingCost;

    private BigDecimal otherCost;

    private BigDecimal totalCost;

    private BigDecimal totalPrice;

    private BigDecimal profit;

    private LocalDateTime confirmTime;

    private LocalDateTime completeTime;

    private String remark;

    private LocalDateTime createTime;

}
