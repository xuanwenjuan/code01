package com.incense.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderMaterialUsageVO {
    private Long id;
    private Long orderId;
    private String orderNo;
    private Long materialId;
    private String materialName;
    private String batchCode;
    private BigDecimal usageQuantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private LocalDateTime createTime;
}
