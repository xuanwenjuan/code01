package com.horncomb.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryDTO {
    private Long id;

    private Long parentId;

    @NotBlank(message = "类目名称不能为空")
    @Size(max = 100, message = "类目名称长度不能超过100")
    private String categoryName;

    @Size(max = 50, message = "类目编码长度不能超过50")
    private String categoryCode;

    @NotNull(message = "层级不能为空")
    private Integer level;

    private Integer sortOrder;

    private Integer status;
}
