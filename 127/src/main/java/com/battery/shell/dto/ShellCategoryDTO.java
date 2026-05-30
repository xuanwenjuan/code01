package com.battery.shell.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ShellCategoryDTO {
    private Long id;

    private Long parentId = 0L;

    @NotBlank(message = "分类名称不能为空")
    private String categoryName;

    @NotBlank(message = "分类编码不能为空")
    private String categoryCode;

    @NotBlank(message = "分类类型不能为空")
    private String categoryType;

    private Integer priority = 0;

    @NotNull(message = "状态不能为空")
    private Integer status;

    private Integer sortOrder = 0;
}
