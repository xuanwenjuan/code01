package com.fishing.distribution.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sorting_order_detail")
public class SortingOrderDetail extends BaseEntity {

    private Long orderId;

    private String orderNo;

    private Long categoryId;

    private String categoryName;

    private String grade;

    private String freshnessLevel;

    private BigDecimal weight;

    private BigDecimal unitPrice;

    private BigDecimal totalAmount;

    private String location;
}
