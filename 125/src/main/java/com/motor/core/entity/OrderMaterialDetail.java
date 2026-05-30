package com.motor.core.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
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
    private String batchCode;
    private BigDecimal usageQuantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private Long operatorId;
    private String remark;
    private LocalDateTime createTime;
}
