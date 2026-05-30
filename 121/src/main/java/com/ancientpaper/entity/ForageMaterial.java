package com.ancientpaper.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("forage_material")
public class ForageMaterial extends BaseEntity {
    private String batchNo;
    private String materialName;
    private String originPlace;
    private BigDecimal fiberDegree;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private Integer status;
    private Integer moistureWarning;
    private LocalDate harvestDate;
    private String warehouseLocation;
    private String remarks;
}