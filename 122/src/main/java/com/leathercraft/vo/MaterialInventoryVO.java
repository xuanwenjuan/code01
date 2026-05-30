package com.leathercraft.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class MaterialInventoryVO {
    private Long id;
    private String batchNo;
    private String materialName;
    private String materialType;
    private String materialTypeName;
    private String spec;
    private String origin;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String status;
    private String statusName;
    private BigDecimal warningQuantity;
    private LocalDate expireDate;
    private Integer expireDays;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
