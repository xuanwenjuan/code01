package com.ancientpaper.vo;

import lombok.Data;

import java.util.List;

@Data
public class CategoryTreeVO {
    private Long id;
    private Long parentId;
    private String categoryName;
    private String categoryCode;
    private Integer sortOrder;
    private Integer status;
    private Integer level;
    private List<CategoryTreeVO> children;
}