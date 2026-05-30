package com.evparts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialStockInDTO {

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    @NotNull(message = "入库数量不能为空")
    private BigDecimal quantity;

    private BigDecimal unitPrice;

    private String warehouse;

    @NotNull(message = "入库日期不能为空")
    private LocalDate inboundDate;

    private LocalDate expiryDate;

    private String remark;

}
