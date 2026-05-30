package com.incense.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialLedgerDTO {
    private Long id;

    @NotBlank(message = "台账类型不能为空")
    private String ledgerType;

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    private String materialName;

    @NotBlank(message = "批次编码不能为空")
    private String batchCode;

    @NotNull(message = "数量不能为空")
    private BigDecimal quantity;

    private String unit = "kg";

    private BigDecimal unitPrice;

    private BigDecimal totalAmount;

    private String relatedOrderNo;

    private String remark;
}
