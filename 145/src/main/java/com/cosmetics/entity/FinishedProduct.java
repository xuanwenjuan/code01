package com.cosmetics.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("finished_product")
public class FinishedProduct {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long productId;

    private Long workOrderId;

    private String batchNo;

    private BigDecimal quantity;

    private BigDecimal remainingQuantity;

    private String unit;

    private LocalDate productionDate;

    private LocalDate expiryDate;

    private LocalDateTime warehouseTime;

    private Long operatorId;

    private Integer status;

    private String remark;

    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
