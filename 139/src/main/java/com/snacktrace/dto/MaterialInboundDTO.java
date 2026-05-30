package com.snacktrace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialInboundDTO {
    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    @NotNull(message = "入库数量不能为空")
    @Positive(message = "入库数量必须大于0")
    private BigDecimal quantity;

    private LocalDate productionDate;

    @NotNull(message = "到期日期不能为空")
    private LocalDate expireDate;

    @NotBlank(message = "供应商不能为空")
    private String supplier;

    private String remark;
}
