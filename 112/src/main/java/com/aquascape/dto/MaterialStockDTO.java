package com.aquascape.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialStockDTO {
    private Long id;

    @NotNull(message = "类目ID不能为空")
    private Long categoryId;

    @NotBlank(message = "素材名称不能为空")
    @Size(max = 100, message = "素材名称长度不能超过100")
    private String materialName;

    @Size(max = 100, message = "产地长度不能超过100")
    private String origin;

    @Size(max = 50, message = "尺寸规格长度不能超过50")
    private String sizeSpec;

    @Size(max = 50, message = "品相等级长度不能超过50")
    private String qualityLevel;

    @NotNull(message = "数量不能为空")
    @Positive(message = "数量必须大于0")
    private Integer quantity;

    @Size(max = 20, message = "单位长度不能超过20")
    private String unit;

    @NotNull(message = "单价不能为空")
    @Positive(message = "单价必须大于0")
    private BigDecimal unitPrice;

    private Integer stockStatus;

    private LocalDate expiryDate;

    private Integer warningDays;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}
