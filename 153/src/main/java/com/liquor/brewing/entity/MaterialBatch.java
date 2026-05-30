package com.liquor.brewing.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.liquor.brewing.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_batch")
public class MaterialBatch extends BaseEntity {

    private String batchCode;

    private Long materialId;

    private BigDecimal quantity;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;

    private LocalDate produceDate;

    private LocalDate expireDate;

    private String supplier;

    private String warehousePosition;

    private Integer status;

    @TableField(exist = false)
    private String materialName;

    @TableField(exist = false)
    private String materialCode;

    @TableField(exist = false)
    private String unit;

    @TableField(exist = false)
    private Integer daysToExpire;
}
