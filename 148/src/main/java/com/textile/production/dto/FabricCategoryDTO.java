package com.textile.production.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FabricCategoryDTO {

    private Long id;

    @NotBlank(message = "分类名称不能为空")
    private String name;

    private Long parentId = 0L;

    @NotNull(message = "分类层级不能为空")
    private Integer level;

    private Integer priority = 0;

    private Integer status = 1;

    private String description;
}
