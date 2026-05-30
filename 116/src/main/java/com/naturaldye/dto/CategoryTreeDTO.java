package com.naturaldye.dto;

import lombok.Data;

import java.util.List;

@Data
public class CategoryTreeDTO {

    private Long id;

    private String categoryName;

    private Long parentId;

    private Integer sortOrder;

    private Integer status;

    private String colorCode;

    private String description;

    private List<CategoryTreeDTO> children;
}
