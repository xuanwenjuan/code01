package com.tarp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TarpCategoryDTO {
    private Long id;

    private Long parentId;

    @NotBlank(message = "分类名称不能为空")
    private String categoryName;

    private String categoryCode;

    @NotNull(message = "排序号不能为空")
    private Integer sortOrder;

    private Integer status;
}
