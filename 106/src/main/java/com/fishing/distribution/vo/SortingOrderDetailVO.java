package com.fishing.distribution.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SortingOrderDetailVO {

    private Long id;

    private Long orderId;

    private String orderNo;

    private Long categoryId;

    private String categoryName;

    private String grade;

    private String freshnessLevel;

    private BigDecimal weight;

    private BigDecimal unitPrice;

    private BigDecimal totalAmount;

    private BigDecimal lossWeight;

    private String location;

    private LocalDateTime createTime;
}
