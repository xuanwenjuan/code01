package com.firecontrol.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialStockInDTO {

    @NotNull(message = "物资ID不能为空")
    private Long materialId;

    @NotNull(message = "入库数量不能为空")
    private BigDecimal quantity;

    private LocalDate productionDate;

    private LocalDate expiryDate;

    private String inspectionReport;

    private String supplier;

    private String warehouseLocation;

    private String remark;
}
