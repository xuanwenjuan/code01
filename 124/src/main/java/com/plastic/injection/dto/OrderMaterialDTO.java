package com.plastic.injection.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderMaterialDTO {

    private Long id;

    private Long orderId;

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    private String materialName;

    private String materialCode;

    private String batchNo;

    @NotNull(message = "计划用量不能为空")
    @DecimalMin(value = "0.01", message = "计划用量必须大于0")
    private BigDecimal planQuantity;

    private BigDecimal actualQuantity;

    private BigDecimal unitPrice;

    private String unit;

    private String remark;
}
