package com.plastic.injection.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_stock")
public class MaterialStock extends BaseEntity {

    private String materialName;

    private String materialCode;

    private String brand;

    private String color;

    private BigDecimal meltIndex;

    private Integer isHygroscopic;

    private String batchNo;

    private BigDecimal quantity;

    private String unit;

    private BigDecimal warningQuantity;

    private Integer stockStatus;

    private LocalDate productionDate;

    private Integer shelfLife;

    private LocalDate expireDate;

    private String warehouseLocation;

    private String remark;
}
