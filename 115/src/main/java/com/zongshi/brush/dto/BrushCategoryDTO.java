package com.zongshi.brush.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

@Data
public class BrushCategoryDTO {
    private Long id;

    @NotNull(message = "父类目ID不能为空")
    private Long parentId;

    @NotBlank(message = "类目名称不能为空")
    @Length(max = 100, message = "类目名称长度不能超过100")
    private String categoryName;

    @NotBlank(message = "类目编码不能为空")
    @Length(max = 50, message = "类目编码长度不能超过50")
    private String categoryCode;

    @NotNull(message = "类目类型不能为空")
    private Integer categoryType;

    private String brushType;

    @Length(max = 100, message = "工艺类型长度不能超过100")
    private String craftType;

    private String suitableFor;

    private Integer sortOrder;

    private Integer status;
}
