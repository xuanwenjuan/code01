package com.motor.core.entity.po;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("material")
public class MaterialPO {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String batchCode;

    private String materialName;

    private String materialType;

    private String specification;

    private BigDecimal thickness;

    private BigDecimal width;

    private BigDecimal weight;

    private String unit;

    private BigDecimal quantity;

    private BigDecimal warningQuantity;

    private Integer stockStatus;

    private BigDecimal lockedQuantity;

    private String storageLocation;

    private LocalDate productionDate;

    private Integer shelfLifeDays;

    private String supplier;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
