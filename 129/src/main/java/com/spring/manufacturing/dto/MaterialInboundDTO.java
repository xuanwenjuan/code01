package com.spring.manufacturing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialInboundDTO {

    @NotBlank(message = "原料名称不能为空")
    private String materialName;

    @NotBlank(message = "原料牌号不能为空")
    private String materialBrand;

    @NotBlank(message = "原料类型不能为空")
    private String materialType;

    private String specification;

    @NotNull(message = "入库数量不能为空")
    @Positive(message = "入库数量必须大于0")
    private BigDecimal quantity;

    @NotBlank(message = "单位不能为空")
    private String unit;

    @NotNull(message = "预警数量不能为空")
    private BigDecimal warningQuantity;

    private Integer isHighToughness;

    @NotBlank(message = "供应商不能为空")
    private String supplier;

    private LocalDate incomingDate;

    private LocalDate expireDate;

    private String remark;
}