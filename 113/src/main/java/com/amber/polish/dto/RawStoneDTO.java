package com.amber.polish.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RawStoneDTO {

    @NotNull(message = "品类ID不能为空")
    private Long categoryId;

    private String origin;

    @Positive(message = "重量必须为正数")
    private BigDecimal weight;

    @Positive(message = "长度必须为正数")
    private BigDecimal length;

    @Positive(message = "宽度必须为正数")
    private BigDecimal width;

    @Positive(message = "高度必须为正数")
    private BigDecimal height;

    private String inclusionSpecies;

    private String clarity;

    @Positive(message = "采购价格必须为正数")
    private BigDecimal purchasePrice;

    private String remark;
}
