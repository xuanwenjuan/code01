package com.aquascape.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MaterialStockVO {
    private Long id;
    private String batchNo;
    private Long categoryId;
    private String categoryName;
    private String materialName;
    private String origin;
    private String sizeSpec;
    private String qualityLevel;
    private Integer quantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private Integer stockStatus;
    private String stockStatusName;
    private LocalDate expiryDate;
    private Integer warningDays;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
