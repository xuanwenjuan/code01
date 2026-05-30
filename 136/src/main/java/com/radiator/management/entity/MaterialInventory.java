package com.radiator.management.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("material_inventory")
public class MaterialInventory {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String materialName;

    private String materialCode;

    private String batchNo;

    private String materialType;

    private String specification;

    private String unit;

    private BigDecimal quantity;

    private BigDecimal warningQuantity;

    private BigDecimal unitPrice;

    private String status;

    private Integer isMoistureProof;

    private String storageReminder;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}