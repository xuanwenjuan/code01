package com.motor.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialDTO {
    @NotBlank(message = "物料名称不能为空")
    private String materialName;

    @NotBlank(message = "物料类型不能为空")
    private String materialType;

    private String specification;

    private BigDecimal thickness;

    private BigDecimal width;

    private BigDecimal weight;

    private String unit;

    @NotNull(message = "库存数量不能为空")
    @Positive(message = "库存数量必须大于0")
    private BigDecimal quantity;

    private BigDecimal warningQuantity;

    private String storageLocation;

    private LocalDate productionDate;

    private Integer shelfLifeDays;

    private String supplier;

    private String remark;
}
