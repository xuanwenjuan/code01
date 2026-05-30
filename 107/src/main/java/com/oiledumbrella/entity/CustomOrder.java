package com.oiledumbrella.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("custom_order")
public class CustomOrder extends BaseEntity {
    private String orderNo;
    private String customerName;
    private String customerPhone;
    private Long styleId;
    private String colorRequirement;
    private String patternDesign;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private BigDecimal deposit;
    private Integer depositStatus;
    private LocalDateTime depositPayTime;
    private BigDecimal remainingAmount;
    private LocalDateTime remainingPayTime;
    private String orderStatus;
    private Long operatorId;
    private Long artisanId;
    private LocalDate estimatedFinishDate;
    private LocalDate actualFinishDate;
    private String expressNo;
    private String remark;
}
