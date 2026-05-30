package com.foundry.impeller.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialQueryDTO {

    private String materialType;

    private String materialName;

    private String specification;

    private String status;

    private String supplier;

    private String batchNo;

    private BigDecimal minQuantity;

    private BigDecimal maxQuantity;
}
