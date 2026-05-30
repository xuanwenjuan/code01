package com.cosmetics.vo;

import lombok.Data;

import java.util.List;

@Data
public class CategoryTreeVO {

    private Long id;
    private String name;
    private Long parentId;
    private Integer level;
    private Integer sortOrder;
    private String description;
    private List<CategoryTreeVO> children;
}
