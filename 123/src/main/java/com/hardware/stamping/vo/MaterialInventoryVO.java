package com.hardware.stamping.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MaterialInventoryVO {
    private Long id;
    private String batchCode;
    private String materialType;
    private String specification;
    private BigDecimal thickness;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private Integer stockStatus;
    private String stockStatusText;
    private Integer isOxidizable;
    private Integer storageDays;
    private LocalDate productionDate;
    private LocalDate expirationDate;
    private String supplier;
    private String warehouseLocation;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
