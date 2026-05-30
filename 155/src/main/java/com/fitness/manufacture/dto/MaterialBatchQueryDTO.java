package com.fitness.manufacture.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialBatchQueryDTO {

    private String keyword;

    private Long materialId;

    private String batchNo;

    private Integer status;

    private String warehouseLocation;

    private BigDecimal minQuantity;

    private BigDecimal maxQuantity;

    private LocalDate productionStartDate;

    private LocalDate productionEndDate;

    private LocalDate expiryStartDate;

    private LocalDate expiryEndDate;

    private Integer expiryWarning;

    private Integer pageNum = 1;

    private Integer pageSize = 10;

    private String orderBy;

    private String orderDirection = "desc";
}
