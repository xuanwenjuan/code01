package com.paper.production.dto.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductCategoryDTO {

    private Long id;

    @NotBlank(message = "分类编码不能为空")
    private String categoryCode;

    @NotBlank(message = "分类名称不能为空")
    private String categoryName;

    private Long parentId;

    @NotNull(message = "分类等级不能为空")
    private Integer level;

    @NotBlank(message = "分类类型不能为空")
    private String categoryType;

    private String specification;
    private String material;
    private BigDecimal unitPrice;
    private Integer priority;
    private Integer status;
    private Integer sort;
    private String remark;
}
