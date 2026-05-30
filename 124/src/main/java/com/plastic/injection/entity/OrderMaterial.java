package com.plastic.injection.entity;

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

    private String materialName;

    private String materialCode;

    private String batchNo;

    private BigDecimal planQuantity;

    private BigDecimal actualQuantity;

    private String unit;

    private String remark;
}
