package com.fastener.production.entity.product;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fastener.production.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("product_category")
public class ProductCategory extends BaseEntity {

    private String categoryName;

    private String categoryCode;

    private Long parentId;

    private Integer level;

    private Integer sortOrder;

    private Integer status;

    private Integer priority;

    private String specification;

    private String material;

    private String standard;

    private String remark;
}
