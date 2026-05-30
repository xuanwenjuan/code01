package com.fan.impeller.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material")
public class Material extends BaseEntity {
    private String batchNo;
    private String materialName;
    private String materialType;
    private String materialCode;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;
    private Integer stockStatus;
    private LocalDate productionDate;
    private LocalDate expiryDate;
    private Integer shelfLifeDays;
    private String supplier;
    private String warehouse;
    private String remark;
    private Integer status;
}
