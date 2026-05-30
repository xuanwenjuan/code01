package com.incense.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialDTO {
    private Long id;

    @NotBlank(message = "批次编码不能为空")
    private String batchCode;

    @NotBlank(message = "原料名称不能为空")
    private String materialName;

    @NotBlank(message = "原料类型不能为空")
    private String materialType;

    @NotBlank(message = "产地不能为空")
    private String origin;

    private String fineness;

    @NotNull(message = "库存数量不能为空")
    private BigDecimal stockQuantity;

    private String unit = "kg";

    private BigDecimal warningQuantity = BigDecimal.TEN;

    private LocalDate expireDate;

    private String status = "SUFFICIENT";

    private BigDecimal unitPrice;

    private String description;
}
