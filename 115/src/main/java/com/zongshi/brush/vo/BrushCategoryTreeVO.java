package com.zongshi.brush.vo;

import lombok.Data;

import java.util.List;

@Data
public class BrushCategoryTreeVO {
    private Long id;

    private Long parentId;

    private String categoryName;

    private String categoryCode;

    private Integer categoryType;

    private String brushType;

    private String craftType;

    private String suitableFor;

    private Integer sortOrder;

    private Integer status;

    private List<BrushCategoryTreeVO> children;
}
