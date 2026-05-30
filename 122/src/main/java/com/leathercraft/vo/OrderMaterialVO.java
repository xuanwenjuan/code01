package com.leathercraft.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderMaterialVO {
    private Long id;
    private Long orderId;
    private Long materialId;
    private String materialBatchNo;
    private String materialName;
    private String materialType;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private LocalDateTime createTime;
}
