package com.ancientpaper.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_material")
public class OrderMaterial extends BaseEntity {
    private Long orderId;
    private Long materialId;
    private BigDecimal quantity;
}