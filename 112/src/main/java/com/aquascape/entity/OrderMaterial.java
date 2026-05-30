package com.aquascape.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_material")
public class OrderMaterial extends BaseEntity {
    private Long orderId;
    private Long stockId;
    private String materialName;
    private Integer quantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private BigDecimal lossRate;
    private BigDecimal lossQuantity;
    private BigDecimal lossAmount;
    private String remark;
}
