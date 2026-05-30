package com.aquascape.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_stock")
public class MaterialStock extends BaseEntity {
    private String batchNo;
    private Long categoryId;
    private String materialName;
    private String origin;
    private String sizeSpec;
    private String qualityLevel;
    private Integer quantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private Integer stockStatus;
    private LocalDate expiryDate;
    private Integer warningDays;
    private String remark;

    @TableField(exist = false)
    private String categoryName;
}
