package com.watchrepair.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WatchCategoryDTO {

    private Long id;

    @NotBlank(message = "类目名称不能为空")
    private String categoryName;

    private Long parentId;

    private Integer level;

    private Integer sort;

    private String categoryCode;

    private String description;
}