package com.amber.customize.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("profit_record")
public class ProfitRecord extends BaseEntity {

    private Long orderId;

    private String orderNo;

    private Long categoryId;

    private String categoryName;

    private BigDecimal rawCost;

    private BigDecimal materialCost;

    private BigDecimal laborCost;

    private BigDecimal totalCost;

    private BigDecimal orderPrice;

    private BigDecimal profit;

    private BigDecimal profitRate;

}