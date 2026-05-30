package com.firecontrol.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("product_category")
public class ProductCategory extends BaseEntity {

    private String categoryName;

    private String categoryCode;

    private Long parentId;

    private Integer categoryLevel;

    private Integer sortOrder;

    private String unit;

    private BigDecimal standardPrice;

    private Integer productionCycle;

    private Integer priority;

    private Integer status;

    private String specification;

    private String fireRating;

    private String usageScenario;

    private String remark;

    private transient List<ProductCategory> children;
}
