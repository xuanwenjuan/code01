package com.cosmetics.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("material_batch")
public class MaterialBatch {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String batchNo;

    private Long materialId;

    private BigDecimal quantity;

    private BigDecimal remainingQuantity;

    private BigDecimal lockedQuantity;

    private BigDecimal unitPrice;

    private String supplier;

    private LocalDate productionDate;

    private LocalDate expiryDate;

    private Integer isExpired;

    private LocalDateTime warehouseTime;

    private Long operatorId;

    private String remark;

    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
