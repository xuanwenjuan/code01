package com.bee.equipment.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
public class MaterialVO extends BaseVO {

    private String batchNo;

    private String name;

    private Long categoryId;

    private String categoryName;

    private String spec;

    private String origin;

    private String unit;

    private BigDecimal quantity;

    private BigDecimal warnQuantity;

    private BigDecimal price;

    private Integer isMoistureSensitive;

    private LocalDate expiryDate;

    private String status;

    private String statusDesc;

    private BigDecimal totalValue;
}
