package com.sheetmetal.compressor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ShellCategoryDTO {
    private Long id;

    @NotBlank(message = "分类名称不能为空")
    private String categoryName;

    @NotBlank(message = "分类编码不能为空")
    private String categoryCode;

    private Long parentId = 0L;

    private Integer sortOrder = 0;

    private Integer priority = 0;

    private Integer status = 1;

    private String description;
}
