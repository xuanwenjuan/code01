package com.fitness.manufacture.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MaterialQueryDTO {

    private String keyword;

    private String materialType;

    private Integer status;

    private String supplier;

    private BigDecimal minStock;

    private BigDecimal maxStock;

    private Integer stockWarning;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer pageNum = 1;

    private Integer pageSize = 10;

    private String orderBy;

    private String orderDirection = "desc";
}
