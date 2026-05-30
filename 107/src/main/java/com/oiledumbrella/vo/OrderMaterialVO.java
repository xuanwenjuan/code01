package com.oiledumbrella.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderMaterialVO {
    private Long id;
    private Long orderId;
    private Long materialId;
    private String materialName;
    private String materialCode;
    private Long batchId;
    private String batchCode;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private Long operatorId;
    private String operatorName;
    private Integer lockStatus;
    private String lockStatusName;
    private LocalDateTime lockTime;
    private LocalDateTime createTime;
}
