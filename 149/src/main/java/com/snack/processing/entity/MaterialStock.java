package com.snack.processing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_stock")
public class MaterialStock extends BaseEntity {

    private Long materialId;
    private String materialName;
    private String materialCode;
    private String batchNo;
    private BigDecimal totalQuantity;
    private BigDecimal availableQuantity;
    private BigDecimal lockedQuantity;
    private BigDecimal usedQuantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;
    private LocalDate productionDate;
    private LocalDate expireDate;
    private Integer isExpiring;
    private Integer stockStatus;
    private String warehouse;
    private String location;
    private String remark;
}
