package com.liquor.brewing.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialQueryDTO {

    private String keyword;

    private Long typeId;

    private Integer status;

    private BigDecimal minQuantity;

    private BigDecimal maxQuantity;

    private LocalDate expireStartDate;

    private LocalDate expireEndDate;

    private Integer daysToExpire;

    private String materialCode;

    private String materialName;

    private String unit;

    private Integer isFermented;

    private Integer minShelfLifeDays;

    private Integer maxShelfLifeDays;

    private BigDecimal minWarningStock;

    private BigDecimal maxWarningStock;
}

