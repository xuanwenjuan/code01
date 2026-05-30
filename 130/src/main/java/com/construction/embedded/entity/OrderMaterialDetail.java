package com.construction.embedded.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("order_material_detail")
public class OrderMaterialDetail {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private Long materialId;

    private String materialName;

    private String specification;

    private BigDecimal usedQuantity;

    private BigDecimal wasteQuantity;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
