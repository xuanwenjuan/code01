package com.watchrepair.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RepairPartDTO {

    private Long id;

    @NotBlank(message = "配件编码不能为空")
    private String partCode;

    @NotBlank(message = "配件名称不能为空")
    private String partName;

    private String partType;

    private String origin;

    private String compatibleModels;

    @NotNull(message = "库存数量不能为空")
    private Integer quantity;

    private Integer warningThreshold;

    @NotNull(message = "单价不能为空")
    private BigDecimal unitPrice;

    private String storageLocation;

    private Integer moistureProof;

    private String remarks;
}