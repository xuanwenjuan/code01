package com.fitness.manufacture.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MaterialOutboundQueryDTO {

    private String keyword;

    private Long materialId;

    private Long workOrderId;

    private String materialType;

    private Integer status;

    private String outboundType;

    private String receiver;

    private BigDecimal minQuantity;

    private BigDecimal maxQuantity;

    private BigDecimal minAmount;

    private BigDecimal maxAmount;

    private LocalDate startDate;

    private LocalDate endDate;

    private String batchNo;

    private Integer pageNum = 1;

    private Integer pageSize = 10;

    private String orderBy;

    private String orderDirection = "desc";
}
