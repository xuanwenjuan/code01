package com.leathercraft.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialInventoryDTO {
    @NotBlank(message = "物料名称不能为空")
    private String materialName;

    @NotBlank(message = "物料类型不能为空")
    private String materialType;

    private String spec;

    private String origin;

    @NotNull(message = "数量不能为空")
    @Positive(message = "数量必须大于0")
    private BigDecimal quantity;

    private String unit;

    @Positive(message = "单价必须大于0")
    private BigDecimal unitPrice;

    private Integer sortOrder;

    private BigDecimal warningQuantity;

    private LocalDate expireDate;

    private String remark;
}
