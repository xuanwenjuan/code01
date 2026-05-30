package com.valve.manufacture.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.valve.manufacture.common.BaseEntity;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_material")
public class WorkOrderMaterial extends BaseEntity {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    private Long batchId;

    @NotNull(message = "数量不能为空")
    private BigDecimal quantity;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;

    private Long receiverId;

    private LocalDateTime receiveTime;

    private String remark;
}
