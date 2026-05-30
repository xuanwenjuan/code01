package com.gear.mfg.dto;

import lombok.Data;

import java.util.List;

@Data
public class CategoryTreeVO {

    private Long id;

    private String categoryName;

    private String categoryCode;

    private Long parentId;

    private Integer level;

    private Integer sort;

    private Integer priority;

    private Integer status;

    private String description;

    private List<CategoryTreeVO> children;
}