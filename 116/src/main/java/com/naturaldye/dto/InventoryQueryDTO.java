package com.naturaldye.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class InventoryQueryDTO {

    private String materialName;

    private Integer materialType;

    private Integer status;

    private String origin;

    private String material;

    private BigDecimal minWeight;

    private BigDecimal maxWeight;

    private BigDecimal minQuantity;

    private BigDecimal maxQuantity;

    private Boolean isFading;

    @Min(value = 1, message = "页码最小为1")
    private Integer pageNum = 1;

    @Min(value = 1, message = "每页条数最小为1")
    private Integer pageSize = 10;
}
