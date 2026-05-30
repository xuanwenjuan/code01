package com.firecontrol.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material")
public class Material extends BaseEntity {

    private String materialCode;

    private String materialName;

    private String materialType;

    private String materialTexture;

    private String specification;

    private String unit;

    private BigDecimal unitPrice;

    private BigDecimal totalStock;

    private BigDecimal availableStock;

    private BigDecimal warningStock;

    private BigDecimal frozenStock;

    private Integer stockStatus;

    private Integer purchaseStatus;

    private String supplier;

    private LocalDate lastPurchaseDate;

    private Integer recheckCycleDays;

    private LocalDate nextRecheckDate;

    private Integer isPressureBearing;

    private String storageLocation;

    private String remark;
}
