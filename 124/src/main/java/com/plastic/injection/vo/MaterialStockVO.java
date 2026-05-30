package com.plastic.injection.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MaterialStockVO {

    private Long id;

    private String materialName;

    private String materialCode;

    private String brand;

    private String color;

    private BigDecimal meltIndex;

    private Integer isHygroscopic;

    private String batchNo;

    private BigDecimal quantity;

    private BigDecimal lockedQuantity;

    private BigDecimal availableQuantity;

    private String unit;

    private BigDecimal warningQuantity;

    private Integer stockStatus;

    private String stockStatusDesc;

    private LocalDate productionDate;

    private Integer shelfLife;

    private LocalDate expireDate;

    private String warehouseLocation;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
