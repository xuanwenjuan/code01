package com.evparts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialStockReturnDTO {

    @NotNull(message = "工单用料ID不能为空")
    private Long workOrderMaterialId;

    @NotNull(message = "退料数量不能为空")
    private BigDecimal quantity;

    private String remark;

}
