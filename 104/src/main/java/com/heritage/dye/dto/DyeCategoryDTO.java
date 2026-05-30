package com.heritage.dye.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DyeCategoryDTO {
    private Long id;

    @NotBlank(message = "类目编码不能为空")
    @Size(min = 2, max = 50, message = "类目编码长度必须在2-50之间")
    @Pattern(regexp = "^[A-Z0-9_]+$", message = "类目编码只能包含大写字母、数字和下划线")
    private String categoryCode;

    @NotBlank(message = "类目名称不能为空")
    @Size(min = 2, max = 100, message = "类目名称长度必须在2-100之间")
    private String categoryName;

    private Long parentId;

    @NotNull(message = "类目级别不能为空")
    @Min(value = 1, message = "类目级别最小为1")
    @Max(value = 5, message = "类目级别最大为5")
    private Integer categoryLevel;

    @NotNull(message = "类目类型不能为空")
    @Min(value = 1, message = "类目类型范围1-4")
    @Max(value = 4, message = "类目类型范围1-4")
    private Integer categoryType;

    private String formula;

    @Size(max = 500, message = "描述长度不能超过500")
    private String description;

    @DecimalMin(value = "0", message = "排序值不能小于0")
    @DecimalMax(value = "9999.99", message = "排序值不能超过9999.99")
    private BigDecimal sortOrder;

    @Min(value = 0, message = "状态只能是0或1")
    @Max(value = 1, message = "状态只能是0或1")
    private Integer status;
}
