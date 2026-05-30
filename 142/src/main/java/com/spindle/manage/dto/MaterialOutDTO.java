package com.spindle.manage.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialOutDTO {

    @NotNull(message = "物料ID不能为空")
    private Long materialId;

    @NotNull(message = "出库数量不能为空")
    private BigDecimal quantity;

    private Long orderId;

    private String remark;

}
