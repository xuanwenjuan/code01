package com.aquascape.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class MaterialStockQueryDTO {
    private String keyword;
    private Long categoryId;
    private String sizeSpec;
    private String qualityLevel;
    private Integer stockStatus;
    private LocalDate startExpiryDate;
    private LocalDate endExpiryDate;
    private String origin;
}
