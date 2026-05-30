package com.valve.manufacture.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.valve.manufacture.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_lock")
public class MaterialLock extends BaseEntity {

    private Long workOrderId;

    private Long materialId;

    private Long batchId;

    private BigDecimal lockQuantity;

    private BigDecimal usedQuantity;

    private BigDecimal releaseQuantity;

    private String status;

    private LocalDateTime lockTime;

    private LocalDateTime releaseTime;

    private Long operatorId;

    private String remark;
}
