package com.construction.material.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MaterialCategoryDTO {

    private Long id;

    @NotBlank(message = "品类名称不能为空")
    private String categoryName;

    @NotBlank(message = "品类编码不能为空")
    private String categoryCode;

    private Long parentId;

    private Integer level;

    private Integer sortOrder;

    private String unit;

    private String specification;

    private Integer priority;

    @NotNull(message = "状态不能为空")
    private Integer status;

    private String remark;
}
