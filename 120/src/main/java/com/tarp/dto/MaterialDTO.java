package com.tarp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialDTO {
    private Long id;

    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    @NotBlank(message = "材料名称不能为空")
    private String materialName;

    private String materialType;

    private String specification;

    private String origin;

    private String batchNo;

    private String unit;

    @NotNull(message = "单价不能为空")
    @PositiveOrZero(message = "单价必须大于等于0")
    private BigDecimal unitPrice;

    @PositiveOrZero(message = "库存数量必须大于等于0")
    private BigDecimal stockQuantity;

    @PositiveOrZero(message = "预警数量必须大于等于0")
    private BigDecimal warningQuantity;

    private Integer status;

    private Integer isOil;
}
