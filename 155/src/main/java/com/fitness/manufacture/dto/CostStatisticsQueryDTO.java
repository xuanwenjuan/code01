package com.fitness.manufacture.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CostStatisticsQueryDTO {

    private String keyword;

    private String workOrderNo;

    private Long productId;

    private Long categoryId;

    private LocalDate startDate;

    private LocalDate endDate;

    private BigDecimal minTotalCost;

    private BigDecimal maxTotalCost;

    private BigDecimal minUnitCost;

    private BigDecimal maxUnitCost;

    private Integer minQuantity;

    private Integer maxQuantity;

    private Integer pageNum = 1;

    private Integer pageSize = 10;

    private String orderBy;

    private String orderDirection = "desc";
}
