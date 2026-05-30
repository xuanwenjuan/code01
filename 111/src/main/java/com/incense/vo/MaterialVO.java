package com.incense.vo;

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
    private String origin;
    private String fineness;
    private BigDecimal stockQuantity;
    private String unit;
    private BigDecimal warningQuantity;
    private LocalDate expireDate;
    private String status;
    private BigDecimal unitPrice;
    private String description;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    private BigDecimal availableQuantity;
    private BigDecimal lockedQuantity;
}
