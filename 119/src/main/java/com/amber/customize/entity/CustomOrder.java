package com.amber.customize.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("custom_order")
public class CustomOrder extends BaseEntity {

    private String orderNo;

    private Long rawId;

    private Long categoryId;

    private String customerName;

    private String customerPhone;

    private String themeDescription;

    private String drawingUrl;

    private Integer status;

    private Long carverId;

    private BigDecimal carvingHours;

    private BigDecimal rawCost;

    private BigDecimal materialCost;

    private BigDecimal laborCost;

    private BigDecimal polishingCost;

    private BigDecimal otherCost;

    private BigDecimal totalCost;

    private BigDecimal totalPrice;

    private BigDecimal profit;

    private LocalDateTime confirmTime;

    private LocalDateTime completeTime;

    private String remark;

}