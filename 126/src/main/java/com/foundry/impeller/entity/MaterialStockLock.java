package com.foundry.impeller.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_stock_lock")
public class MaterialStockLock extends BaseEntity {

    private Long workOrderId;

    private Long materialId;

    private String materialName;

    private String batchNo;

    private BigDecimal lockQuantity;

    private String lockType;

    private String status;

    private LocalDateTime lockTime;

    private LocalDateTime unlockTime;

    private String remark;
}
