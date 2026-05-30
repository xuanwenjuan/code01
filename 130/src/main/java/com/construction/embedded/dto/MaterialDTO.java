package com.construction.embedded.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MaterialDTO {
    private Long id;

    @NotBlank(message = "原料名称不能为空")
    private String materialName;

    @NotBlank(message = "原料类型不能为空")
    private String materialType;

    @NotBlank(message = "规格型号不能为空")
    private String specification;

    private String unit;

    @NotNull(message = "库存数量不能为空")
    @PositiveOrZero(message = "库存数量不能为负数")
    private BigDecimal quantity;

    @PositiveOrZero(message = "预警数量不能为负数")
    private BigDecimal warningQuantity;

    @Positive(message = "单价必须大于0")
    private BigDecimal unitPrice;

    private String storageLocation;

    private Integer isHumidEnv;

    @PositiveOrZero(message = "锈蚀预警天数不能为负数")
    private Integer rustWarningDays;

    private String status;
}
