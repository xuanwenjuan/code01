package com.incense.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("order_material_usage")
public class OrderMaterialUsage {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long orderId;
    private String orderNo;
    private Long materialId;
    private String materialName;
    private String batchCode;
    private BigDecimal usageQuantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private LocalDateTime createTime;
}
