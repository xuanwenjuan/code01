package com.fishing.distribution.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("revenue_item")
public class RevenueItem extends BaseEntity {

    private String itemNo;

    private String itemType;

    private String itemCategory;

    private Long orderId;

    private String orderNo;

    private BigDecimal amount;

    private String payerPayee;

    private String remark;

    private Long createBy;
}
