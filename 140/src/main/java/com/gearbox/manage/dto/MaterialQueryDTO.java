package com.gearbox.manage.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialQueryDTO {
    private String materialCode;

    private String materialName;

    private String materialType;

    private String specification;

    private String status;

    private String supplier;

    private BigDecimal minQuantity;

    private BigDecimal maxQuantity;

    private BigDecimal minUnitPrice;

    private BigDecimal maxUnitPrice;

    private String sortField = "createTime";

    private String sortOrder = "desc";
}
