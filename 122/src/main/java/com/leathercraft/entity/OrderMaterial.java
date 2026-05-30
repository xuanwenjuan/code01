package com.leathercraft.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("order_material")
public class OrderMaterial {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long orderId;
    private Long materialId;
    private String materialBatchNo;
    private String materialName;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableLogic
    private Integer deleted;
}
