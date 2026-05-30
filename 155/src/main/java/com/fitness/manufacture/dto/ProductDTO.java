package com.fitness.manufacture.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class ProductDTO implements Serializable {

    private Long id;

    @NotBlank(message = "产品名称不能为空")
    private String productName;

    @NotBlank(message = "产品编码不能为空")
    private String productCode;

    @NotNull(message = "分类ID不能为空")
    private Long categoryId;

    private String specification;

    private String model;

    private String imageUrl;

    private BigDecimal standardCost;

    private BigDecimal salePrice;

    private Integer priority;

    private Integer status;

    private String description;

    private String productionProcess;

    private Integer estimatedHours;

    private BigDecimal weight;
}
