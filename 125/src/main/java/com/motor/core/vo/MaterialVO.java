package com.motor.core.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MaterialVO {
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

    private String stockStatusDesc;

    private BigDecimal lockedQuantity;

    private BigDecimal availableQuantity;

    private String storageLocation;

    private LocalDate productionDate;

    private Integer shelfLifeDays;

    private Integer remainingDays;

    private String supplier;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
