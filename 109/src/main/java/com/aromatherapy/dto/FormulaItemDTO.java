package com.aromatherapy.dto;

import com.aromatherapy.validation.ValidPositiveNumber;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class FormulaItemDTO {

    @NotNull(message = "原料ID不能为空")
    private Long rawMaterialId;

    @NotNull(message = "配比不能为空")
    @ValidPositiveNumber(message = "配比必须大于0")
    private BigDecimal proportion;

    @NotNull(message = "用量不能为空")
    @ValidPositiveNumber(message = "用量必须大于0")
    private BigDecimal dosage;
}
