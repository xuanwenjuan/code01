package com.construction.material.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("inventory_flow")
public class InventoryFlow {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long inventoryId;

    private String materialName;

    private String specification;

    private String unit;

    private String batchNo;

    private Integer flowType;

    private String flowTypeName;

    private BigDecimal beforeQuantity;

    private BigDecimal changeQuantity;

    private BigDecimal afterQuantity;

    private BigDecimal unitPrice;

    private BigDecimal changeAmount;

    private String relatedOrderNo;

    private String warehouse;

    private String operator;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT)
    private Long createBy;
}
