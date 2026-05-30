package com.sheetmetal.compressor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialDTO {
    private Long id;

    @NotBlank(message = "原料名称不能为空")
    private String materialName;

    @NotBlank(message = "原料编码不能为空")
    private String materialCode;

    @NotNull(message = "原料类型不能为空")
    private Integer materialType;

    private String spec;

    private BigDecimal thickness;

    private BigDecimal width;

    private BigDecimal length;

    private String unit;

    @NotNull(message = "总数量不能为空")
    private BigDecimal totalQuantity;

    private BigDecimal availableQuantity;

    private BigDecimal warningQuantity = BigDecimal.ZERO;

    private BigDecimal unitPrice;

    private Integer status = 1;

    private Integer isOutdoor = 0;

    private Integer moistureProofDays = 30;

    private String warehouseLocation;

    private String supplier;

    private String description;
}
