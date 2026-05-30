package com.firecontrol.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductCategoryDTO {

    private Long id;

    @NotBlank(message = "分类名称不能为空")
    private String categoryName;

    @NotBlank(message = "分类编码不能为空")
    private String categoryCode;

    private Long parentId;

    @NotNull(message = "分类层级不能为空")
    private Integer categoryLevel;

    private Integer sortOrder;

    private String unit;

    private BigDecimal standardPrice;

    private Integer productionCycle;

    private Integer priority;

    @NotNull(message = "状态不能为空")
    private Integer status;

    private String specification;

    private String fireRating;

    private String usageScenario;

    private String remark;
}
