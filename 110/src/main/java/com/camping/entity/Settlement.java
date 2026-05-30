package com.camping.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("settlement")
public class Settlement extends BaseEntity {

    private Long leaderId;

    private String leaderName;

    private String settlementMonth;

    private Integer orderCount;

    private BigDecimal totalSales;

    private BigDecimal materialCost;

    private BigDecimal processingCost;

    private BigDecimal shippingCost;

    private BigDecimal commissionAmount;

    private BigDecimal profit;

    private Integer status;

    private String remark;
}
