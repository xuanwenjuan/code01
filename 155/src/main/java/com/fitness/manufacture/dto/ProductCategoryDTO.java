package com.fitness.manufacture.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;

@Data
public class ProductCategoryDTO implements Serializable {

    private Long id;

    @NotBlank(message = "分类名称不能为空")
    private String categoryName;

    @NotBlank(message = "分类编码不能为空")
    private String categoryCode;

    private Long parentId;

    @NotNull(message = "层级不能为空")
    private Integer level;

    private Integer sort;

    private String icon;

    private String description;

    private Integer status;
}
