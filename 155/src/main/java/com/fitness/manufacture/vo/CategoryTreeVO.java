package com.fitness.manufacture.vo;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class CategoryTreeVO implements Serializable {

    private Long id;

    private String categoryName;

    private String categoryCode;

    private Long parentId;

    private Integer level;

    private Integer sort;

    private String icon;

    private String description;

    private Integer status;

    private List<CategoryTreeVO> children;
}
