package com.zongshi.brush.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_archive")
public class MaterialArchive extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String materialCode;

    private String materialName;

    private Integer materialType;

    private String originPlace;

    private String grade;

    private Long categoryId;

    private String unit;

    private BigDecimal unitPrice;

    private BigDecimal stockQuantity;

    private BigDecimal lockedQuantity;

    private BigDecimal availableQuantity;

    private BigDecimal warningQuantity;

    private Integer isMoistureSensitive;

    private LocalDate moistureExpireDate;

    private LocalDate purchaseDate;

    private String supplier;

    private String remark;

    private Integer status;
}
