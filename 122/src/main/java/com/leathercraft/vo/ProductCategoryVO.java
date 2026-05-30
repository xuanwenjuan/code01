package com.leathercraft.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductCategoryVO {
    private Long id;
    private Long parentId;
    private String categoryName;
    private String categoryCode;
    private Integer sortOrder;
    private Integer status;
    private String statusName;
    private List<ProductCategoryVO> children;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
