package com.rotor.manufacture.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cost_accounting")
public class CostAccounting extends BaseEntity {
    private Long orderId;
    private String orderNo;
    private Long productId;
    private String productName;
    private Integer quantity;

    private BigDecimal siliconSteelCost;
    private BigDecimal magnetCost;
    private BigDecimal shaftCost;
    private BigDecimal coatingCost;
    private BigDecimal otherMaterialCost;

    private BigDecimal equipmentCost;
    private BigDecimal laborCost;
    private BigDecimal energyCost;

    private BigDecimal scrapCost;
    private BigDecimal otherCost;

    private BigDecimal totalCost;
    private BigDecimal unitCost;

    private LocalDateTime accountingDate;
    private String accountant;
    private String remark;
}