package com.snack.processing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material")
public class Material extends BaseEntity {

    private String name;
    private String code;
    private Long categoryId;
    private String categoryName;
    private String unit;
    private String spec;
    private BigDecimal warningStock;
    private BigDecimal maxStock;
    private Integer isFresh;
    private Integer shelfLifeDays;
    private String supplier;
    private Integer status;
    private String description;
}
