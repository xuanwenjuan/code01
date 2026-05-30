package com.paper.production.entity.product;

import com.baomidou.mybatisplus.annotation.TableName;
import com.paper.production.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("product_category")
public class ProductCategory extends BaseEntity {

    private String categoryCode;
    private String categoryName;
    private Long parentId;
    private Integer level;
    private String categoryType;
    private String specification;
    private String material;
    private BigDecimal unitPrice;
    private Integer priority;
    private Integer status;
    private Integer sort;
    private String remark;
}
