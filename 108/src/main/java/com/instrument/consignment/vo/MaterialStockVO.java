package com.instrument.consignment.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MaterialStockVO {

    private Long id;

    private String materialCode;

    private String materialName;

    private String materialType;

    private String materialTypeDesc;

    private String specification;

    private String unit;

    private BigDecimal unitPrice;

    private Integer totalQuantity;

    private Integer lockedQuantity;

    private Integer availableQuantity;

    private String supplier;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
