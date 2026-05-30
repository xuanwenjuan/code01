package com.cosmetics.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialQueryDTO {

    private String keyword;

    private Integer type;

    private Integer status;

    private Integer isLiquid;

    private BigDecimal minStock;

    private BigDecimal maxStock;

    private Boolean expiringWarning;

    private Integer expiringDays;
}
