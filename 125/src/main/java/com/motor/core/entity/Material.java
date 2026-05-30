package com.motor.core.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material")
public class Material extends BaseEntity {
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
    private String storageLocation;
    private LocalDate productionDate;
    private Integer shelfLifeDays;
    private String supplier;
    private String remark;
}
