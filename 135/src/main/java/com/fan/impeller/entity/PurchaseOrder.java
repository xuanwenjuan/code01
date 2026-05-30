package com.fan.impeller.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("purchase_order")
public class PurchaseOrder extends BaseEntity {
    private String orderNo;
    private Long materialId;
    private String materialName;
    private String materialType;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;
    private String supplier;
    private Integer status;
    private Long applicantId;
    private String applicantName;
    private Long auditorId;
    private String auditorName;
    private LocalDateTime auditTime;
    private LocalDateTime expectTime;
    private String remark;
}
