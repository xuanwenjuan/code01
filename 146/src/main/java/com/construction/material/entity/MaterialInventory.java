package com.construction.material.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("material_inventory")
public class MaterialInventory {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long categoryId;

    private String categoryName;

    private String materialName;

    private String materialCode;

    private String specification;

    private String unit;

    private BigDecimal quantity;

    private BigDecimal unitPrice;

    private BigDecimal totalAmount;

    private String batchNo;

    private String supplier;

    private String warehouse;

    private String location;

    private LocalDateTime productionDate;

    private LocalDateTime expiryDate;

    private Integer moistureProofDays;

    private Integer inventoryStatus;

    private BigDecimal warningQuantity;

    private BigDecimal maxQuantity;

    private BigDecimal lockedQuantity;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableField(fill = FieldFill.INSERT)
    private Long createBy;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updateBy;

    @TableLogic
    private Integer deleted;
}
