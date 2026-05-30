package com.incense.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductionLossVO {
    private Long id;
    private Long orderId;
    private String orderNo;
    private Long materialId;
    private String materialName;
    private String batchCode;
    private String lossType;
    private BigDecimal lossQuantity;
    private BigDecimal unitPrice;
    private BigDecimal lossAmount;
    private String lossReason;
    private Long operatorId;
    private String operatorName;
    private LocalDateTime createTime;
}
