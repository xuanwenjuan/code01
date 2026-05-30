package com.gear.mfg.dto;

import lombok.Data;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MaterialStockQueryDTO {

    private String materialName;

    private String materialType;

    private String batchNo;

    private Integer status;

    private Long warehouseId;

    private BigDecimal minQuantity;

    private BigDecimal maxQuantity;

    private LocalDateTime startInDate;

    private LocalDateTime endInDate;

    private Boolean rustProofWarning;

    @NotNull(message = "页码不能为空")
    @Min(value = 1, message = "页码不能小于1")
    private Integer pageNum = 1;

    @NotNull(message = "每页条数不能为空")
    @Min(value = 1, message = "每页条数不能小于1")
    private Integer pageSize = 10;
}
