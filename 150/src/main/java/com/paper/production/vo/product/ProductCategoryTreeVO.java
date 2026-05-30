package com.paper.production.vo.product;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductCategoryTreeVO {

    private Long id;
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
    private List<ProductCategoryTreeVO> children;
}
