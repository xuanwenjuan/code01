package com.construction.embedded.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class ProductCategoryDTO {
    private Long id;

    @NotNull(message = "父分类ID不能为空")
    private Long parentId;

    @NotBlank(message = "分类名称不能为空")
    private String categoryName;

    @NotBlank(message = "分类编码不能为空")
    private String categoryCode;

    private String categoryType;

    @PositiveOrZero(message = "排序字段不能为负数")
    private Integer sortOrder;

    @PositiveOrZero(message = "优先级不能为负数")
    private Integer priority;

    private Integer status;
}
