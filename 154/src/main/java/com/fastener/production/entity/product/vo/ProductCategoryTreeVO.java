package com.fastener.production.entity.product.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductCategoryTreeVO {

    private Long id;

    private String categoryName;

    private String categoryCode;

    private Long parentId;

    private Integer level;

    private Integer sortOrder;

    private Integer status;

    private String statusName;

    private Integer priority;

    private String specification;

    private String material;

    private String standard;

    private String remark;

    private LocalDateTime createTime;

    private List<ProductCategoryTreeVO> children;
}
