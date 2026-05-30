package com.bee.equipment.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryDTO {

    private Long id;

    @Min(value = 0, message = "父级类目ID不能为负数")
    private Long parentId = 0L;

    @NotBlank(message = "类目名称不能为空")
    @Size(max = 100, message = "类目名称长度不能超过100个字符")
    private String name;

    @NotBlank(message = "类目编码不能为空")
    @Size(max = 50, message = "类目编码长度不能超过50个字符")
    @Pattern(regexp = "^[A-Za-z0-9_]+$", message = "类目编码只能包含字母、数字和下划线")
    private String code;

    @Min(value = 0, message = "排序值不能小于0")
    @Max(value = 99999, message = "排序值不能超过99999")
    private Integer sortOrder = 0;

    @NotNull(message = "状态不能为空")
    @Min(value = 0, message = "状态值不正确")
    @Max(value = 1, message = "状态值不正确")
    private Integer status;
}
