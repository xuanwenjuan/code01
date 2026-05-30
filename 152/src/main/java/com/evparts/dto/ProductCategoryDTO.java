package com.evparts.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProductCategoryDTO {

    private Long id;

    private Long parentId = 0L;

    @NotBlank(message = "分类名称不能为空")
    private String categoryName;

    @NotBlank(message = "分类编码不能为空")
    private String categoryCode;

    private Integer sortOrder = 0;

    private Integer status = 1;

    private String remark;

}
