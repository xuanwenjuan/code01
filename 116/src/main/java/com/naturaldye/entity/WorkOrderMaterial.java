package com.naturaldye.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_material")
public class WorkOrderMaterial extends BaseEntity {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotNull(message = "库存ID不能为空")
    private Long inventoryId;

    private String materialName;

    private BigDecimal quantity;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;

    private String remarks;
}
