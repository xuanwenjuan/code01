package com.aquascape.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CustomOrderVO {
    private Long id;
    private String orderNo;
    private String customerName;
    private String customerPhone;
    private String customerAddress;
    private Long scaperId;
    private String scaperName;
    private String tankSize;
    private String designScheme;
    private BigDecimal totalPrice;
    private BigDecimal materialCost;
    private BigDecimal laborCost;
    private BigDecimal lossCost;
    private BigDecimal profit;
    private BigDecimal deposit;
    private Integer orderStatus;
    private String orderStatusName;
    private LocalDateTime schemeConfirmTime;
    private LocalDateTime buildStartTime;
    private LocalDateTime buildEndTime;
    private LocalDateTime deliverTime;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private List<OrderMaterialVO> orderMaterials;
}
