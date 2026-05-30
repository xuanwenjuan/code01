package com.oiledumbrella.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CustomOrderCreateDTO {
    @NotBlank(message = "客户姓名不能为空")
    private String customerName;

    @NotBlank(message = "客户电话不能为空")
    private String customerPhone;

    @NotNull(message = "款式ID不能为空")
    private Long styleId;

    private String colorRequirement;
    private String patternDesign;

    @NotNull(message = "数量不能为空")
    @Positive(message = "数量必须大于0")
    private Integer quantity;

    @NotNull(message = "单价不能为空")
    private BigDecimal unitPrice;

    private BigDecimal deposit;
    private String remark;
}
