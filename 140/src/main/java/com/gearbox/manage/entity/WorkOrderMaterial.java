package com.gearbox.manage.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_material")
public class WorkOrderMaterial extends BaseEntity {
    private Long workOrderId;
    private Long materialId;
    private Long batchId;
    private String materialName;
    private BigDecimal requiredQuantity;
    private BigDecimal actualQuantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String status;
    private LocalDateTime pickTime;
    private Long pickUserId;
}
