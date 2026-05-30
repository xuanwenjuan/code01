package com.fitness.manufacture.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fitness.manufacture.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("product")
public class Product extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String productName;

    private String productCode;

    private Long categoryId;

    private String categoryPath;

    private String specification;

    private String model;

    private String imageUrl;

    private BigDecimal standardCost;

    private BigDecimal salePrice;

    private Integer priority;

    private Integer status;

    private String description;

    private String productionProcess;

    private Integer estimatedHours;

    private BigDecimal weight;
}
