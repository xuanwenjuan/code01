package com.fishing.distribution.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class FishCategoryDTO {

    @Min(value = 0, message = "父类目ID不合法")
    private Long parentId = 0L;

    @NotBlank(message = "类目编码不能为空")
    @Size(max = 50, message = "类目编码长度不能超过50字符")
    @Pattern(regexp = "^[A-Za-z0-9_]+$", message = "类目编码只能包含字母、数字和下划线")
    private String categoryCode;

    @NotBlank(message = "类目名称不能为空")
    @Size(max = 100, message = "类目名称长度不能超过100字符")
    private String categoryName;

    @NotBlank(message = "类目类型不能为空")
    @Pattern(regexp = "^(DEEP_SEA_FISH|SHORE_CRAB|OCEAN_SHELLFISH|DRIED_PRODUCT)$", 
             message = "类目类型不合法")
    private String categoryType;

    @Size(max = 500, message = "图标URL长度不能超过500字符")
    private String icon;

    @Min(value = 0, message = "排序值不能为负")
    @Max(value = 9999, message = "排序值不能超过9999")
    private Integer sortOrder = 0;

    @Min(value = 0, message = "状态值不合法")
    @Max(value = 1, message = "状态值不合法")
    private Integer status = 1;
}
