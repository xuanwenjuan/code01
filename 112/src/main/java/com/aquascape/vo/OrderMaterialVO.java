package com.aquascape.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderMaterialVO {
    private Long id;
    private Long orderId;
    private Long stockId;
    private String materialName;
    private Integer quantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private BigDecimal lossRate;
    private BigDecimal lossQuantity;
    private BigDecimal lossAmount;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
