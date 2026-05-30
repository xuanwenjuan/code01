package com.fastener.production.entity.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductCategoryDTO {

    private Long id;

    @NotBlank(message = "分类名称不能为空")
    private String categoryName;

    @NotBlank(message = "分类编码不能为空")
    private String categoryCode;

    private Long parentId = 0L;

    private Integer level = 1;

    private Integer sortOrder = 0;

    @NotNull(message = "状态不能为空")
    private Integer status;

    private Integer priority = 0;

    private String specification;

    private String material;

    private String standard;

    private String remark;
}
