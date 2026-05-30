package com.aluminum.extrusion.vo;

import lombok.Data;

import java.util.List;

@Data
public class CategoryTreeVO {
    private Long id;
    private String categoryName;
    private Long parentId;
    private Integer level;
    private String categoryCode;
    private String description;
    private Integer priority;
    private Integer status;
    private List<CategoryTreeVO> children;
}
