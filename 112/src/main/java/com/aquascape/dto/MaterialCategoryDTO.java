package com.aquascape.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MaterialCategoryDTO {
    private Long id;

    @NotBlank(message = "类目名称不能为空")
    @Size(max = 50, message = "类目名称长度不能超过50")
    private String categoryName;

    private Long parentId;

    private Integer level;

    @NotNull(message = "排序不能为空")
    private Integer sort;

    private Integer status;

    @Size(max = 255, message = "图标地址长度不能超过255")
    private String icon;

    @Size(max = 500, message = "描述长度不能超过500")
    private String description;
}
