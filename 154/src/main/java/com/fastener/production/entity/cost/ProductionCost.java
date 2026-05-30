package com.fastener.production.entity.cost;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fastener.production.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_cost")
public class ProductionCost extends BaseEntity {

    private String costNo;

    private Integer costType;

    private Long workOrderId;

    private String orderNo;

    private Long categoryId;

    private String categoryName;

    private BigDecimal amount;

    private BigDecimal quantity;

    private BigDecimal unitPrice;

    private LocalDate costDate;

    private String operator;

    private String remark;
}
