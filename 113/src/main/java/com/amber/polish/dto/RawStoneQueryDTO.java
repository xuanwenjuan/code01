package com.amber.polish.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RawStoneQueryDTO {

    private Long categoryId;

    private String origin;

    private String clarity;

    private String status;

    private BigDecimal minWeight;

    private BigDecimal maxWeight;

    private String traceCode;
}
