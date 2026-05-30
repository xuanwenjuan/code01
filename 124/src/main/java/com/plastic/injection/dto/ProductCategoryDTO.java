package com.plastic.injection.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductCategoryDTO {

    private Long id;

    @NotBlank(message = "类目名称不能为空")
    private String categoryName;

    @NotBlank(message = "类目编码不能为空")
    private String categoryCode;

    private Long parentId;

    private Integer level;

    private Integer sort;

    private Integer priority;

    private Integer status;

    private String remark;
}
