package com.aquascape.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderMaterialDTO {
    private Long id;

    @NotNull(message = "库存ID不能为空")
    private Long stockId;

    @Size(max = 100, message = "素材名称长度不能超过100")
    private String materialName;

    @NotNull(message = "数量不能为空")
    @Positive(message = "数量必须大于0")
    private Integer quantity;

    @Size(max = 20, message = "单位长度不能超过20")
    private String unit;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;

    private BigDecimal lossRate;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}
