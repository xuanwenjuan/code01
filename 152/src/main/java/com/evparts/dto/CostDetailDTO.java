package com.evparts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CostDetailDTO {

    private Long id;

    @NotBlank(message = "成本类型不能为空")
    private String costType;

    @NotBlank(message = "成本项名称不能为空")
    private String itemName;

    private BigDecimal quantity;

    private BigDecimal unitPrice;

    @NotNull(message = "总价不能为空")
    private BigDecimal totalPrice;

    private String remark;

}
