package com.rotor.manufacture.dto;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CostAccountingQueryDTO {
    private String keyword;
    private String orderNo;
    private Long productId;

    private BigDecimal minTotalCost;
    private BigDecimal maxTotalCost;
    private BigDecimal minUnitCost;
    private BigDecimal maxUnitCost;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startAccountingDate;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endAccountingDate;

    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String orderBy = "createTime";
    private String orderDirection = "desc";
}