package com.firecontrol.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialDTO {

    private Long id;

    @NotBlank(message = "物资编码不能为空")
    private String materialCode;

    @NotBlank(message = "物资名称不能为空")
    private String materialName;

    @NotBlank(message = "物资类型不能为空")
    private String materialType;

    private String materialTexture;

    private String specification;

    @NotBlank(message = "计量单位不能为空")
    private String unit;

    @NotNull(message = "单价不能为空")
    private BigDecimal unitPrice;

    private BigDecimal totalStock;

    private BigDecimal availableStock;

    @NotNull(message = "预警库存不能为空")
    private BigDecimal warningStock;

    private Integer stockStatus;

    private Integer purchaseStatus;

    private String supplier;

    private LocalDate lastPurchaseDate;

    private Integer recheckCycleDays;

    private LocalDate nextRecheckDate;

    private Integer isPressureBearing;

    private String storageLocation;

    private String remark;
}
