package com.snack.processing.dto.material;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class StockInDTO {

    @NotNull(message = "材料ID不能为空")
    private Long materialId;

    @NotNull(message = "入库数量不能为空")
    private BigDecimal quantity;

    @NotNull(message = "单价不能为空")
    private BigDecimal unitPrice;

    private LocalDate productionDate;

    private LocalDate expireDate;

    private String warehouse;

    private String location;

    private String remark;
}
