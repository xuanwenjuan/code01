package com.amber.polish.vo;

import lombok.Data;

import java.util.List;

@Data
public class CategoryTreeVO {

    private Long id;

    private Long parentId;

    private String categoryName;

    private String categoryCode;

    private String categoryType;

    private Integer sortOrder;

    private Integer status;

    private List<CategoryTreeVO> children;
}
