package com.tarp.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("work_order_material")
public class WorkOrderMaterial {
    private Long id;
    private Long workOrderId;
    private Long materialId;
    private String materialName;
    private BigDecimal usageQuantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private LocalDateTime createTime;
}
