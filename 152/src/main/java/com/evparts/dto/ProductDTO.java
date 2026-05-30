package com.evparts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductDTO {

    private Long id;

    @NotNull(message = "分类ID不能为空")
    private Long categoryId;

    @NotBlank(message = "产品名称不能为空")
    private String productName;

    @NotBlank(message = "产品编码不能为空")
    private String productCode;

    private String specification;

    private String unit = "件";

    private Integer priority = 0;

    private Integer status = 1;

    private Integer standardTime;

    private String remark;

}
