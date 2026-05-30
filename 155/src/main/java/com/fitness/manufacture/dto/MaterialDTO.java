package com.fitness.manufacture.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialDTO {

    private Long id;

    @NotBlank(message = "物料名称不能为空")
    private String materialName;

    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    @NotBlank(message = "物料类型不能为空")
    private String materialType;

    private String specification;

    private String unit;

    private BigDecimal unitPrice;

    private BigDecimal stockQuantity;

    private BigDecimal warningQuantity;

    private Integer status;

    private Integer shelfLifeDays;

    private String supplier;

    private String remark;
}
