package com.woodendoor.production.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cost_detail")
public class CostDetail extends BaseEntity {
    private Long costId;
    private Long orderId;
    private String orderNo;
    private Integer costType;
    private String costTypeName;
    private Long materialId;
    private String materialName;
    private BigDecimal plannedQuantity;
    private BigDecimal actualQuantity;
    private BigDecimal wasteQuantity;
    private BigDecimal unitPrice;
    private BigDecimal plannedTotalPrice;
    private BigDecimal actualTotalPrice;
    private BigDecimal wasteTotalPrice;
    private BigDecimal wasteRate;
    private String remark;
}