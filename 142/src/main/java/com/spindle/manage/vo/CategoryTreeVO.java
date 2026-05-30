package com.spindle.manage.vo;

import lombok.Data;

import java.util.List;

@Data
public class CategoryTreeVO {

    private Long id;

    private String categoryCode;

    private String categoryName;

    private Long parentId;

    private Integer level;

    private Integer sort;

    private Integer status;

    private String description;

    private List<CategoryTreeVO> children;

}
