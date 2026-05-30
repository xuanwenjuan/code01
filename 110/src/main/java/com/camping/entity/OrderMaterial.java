package com.camping.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_material")
public class OrderMaterial extends BaseEntity {

    @NotNull(message = "订单ID不能为空")
    private Long orderId;

    @NotNull(message = "物料ID不能为空")
    private Long materialId;

    private String materialName;

    private BigDecimal quantity;

    private String unit;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;

    private String remark;
}
