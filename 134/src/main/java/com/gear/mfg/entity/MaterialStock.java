package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_stock")
public class MaterialStock extends BaseEntity {

    private String batchNo;

    private String materialName;

    private String materialType;

    private String materialSpec;

    private BigDecimal quantity;

    private BigDecimal lockedQuantity;

    private String unit;

    private BigDecimal warnQuantity;

    private Integer status;

    private LocalDate inDate;

    private Integer rustProofDays;

    private LocalDate rustProofExpireDate;

    private String warehouse;

    private String location;

    private String remark;
}