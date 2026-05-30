package com.textile.production.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RawMaterialDTO {

    private Long id;

    @NotBlank(message = "原料名称不能为空")
    private String name;

    @NotBlank(message = "原料类型不能为空")
    private String type;

    private String specification;

    @NotBlank(message = "计量单位不能为空")
    private String unit;

    private BigDecimal totalQuantity = BigDecimal.ZERO;

    private BigDecimal warningQuantity = BigDecimal.ZERO;

    private Integer moistureProof = 0;

    private String status = "NORMAL";

    private String description;
}
