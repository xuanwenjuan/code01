package com.fitness.manufacture.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fitness.manufacture.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_material_lock")
public class WorkOrderMaterialLock extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long workOrderId;

    private String workOrderNo;

    private Long materialId;

    private String materialName;

    private Long batchId;

    private String batchNo;

    private BigDecimal lockedQuantity;

    private BigDecimal unitPrice;

    private BigDecimal totalAmount;

    private Integer status;

    private String remark;
}
