package com.aquascape.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("custom_order")
public class CustomOrder extends BaseEntity {
    private String orderNo;
    private String customerName;
    private String customerPhone;
    private String customerAddress;
    private Long scaperId;
    private String tankSize;
    private String designScheme;
    private BigDecimal totalPrice;
    private BigDecimal materialCost;
    private BigDecimal laborCost;
    private BigDecimal lossCost;
    private BigDecimal profit;
    private BigDecimal deposit;
    private Integer orderStatus;
    private Integer stockLocked;
    private LocalDateTime schemeConfirmTime;
    private LocalDateTime buildStartTime;
    private LocalDateTime buildEndTime;
    private LocalDateTime deliverTime;
    private String remark;

    @TableField(exist = false)
    private String scaperName;

    @TableField(exist = false)
    private List<OrderMaterial> orderMaterials;
}
