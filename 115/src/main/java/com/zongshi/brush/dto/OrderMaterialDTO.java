package com.zongshi.brush.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderMaterialDTO {
    private Long id;

    private Long orderId;

    private Long materialId;

    private String materialName;

    private BigDecimal usageQuantity;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;
}
