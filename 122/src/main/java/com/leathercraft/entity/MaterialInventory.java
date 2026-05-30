package com.leathercraft.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("material_inventory")
public class MaterialInventory {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String batchNo;
    private String materialName;
    private String materialType;
    private String spec;
    private String origin;
    private BigDecimal quantity;
    private BigDecimal lockedQuantity;
    private BigDecimal availableQuantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String status;
    private BigDecimal warningQuantity;
    private LocalDate expireDate;
    private String remark;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableLogic
    private Integer deleted;
}
