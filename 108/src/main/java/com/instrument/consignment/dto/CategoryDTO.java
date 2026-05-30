package com.instrument.consignment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CategoryDTO {

    private Long id;

    @NotNull(message = "父类目ID不能为空")
    private Long parentId;

    @NotBlank(message = "类目名称不能为空")
    private String categoryName;

    private String categoryCode;

    @NotBlank(message = "类目类型不能为空")
    private String categoryType;

    private Integer sortOrder;

    private Integer status;

    private String description;
}
