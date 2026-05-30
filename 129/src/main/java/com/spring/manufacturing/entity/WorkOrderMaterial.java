package com.spring.manufacturing.entity;

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

    private String materialName;

    private String batchNo;

    private BigDecimal usedQuantity;

    private String unit;

    private Long operatorId;

    private LocalDateTime receiveTime;
}