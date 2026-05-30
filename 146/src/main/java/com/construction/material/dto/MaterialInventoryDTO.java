package com.construction.material.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MaterialInventoryDTO {

    private Long id;

    @NotNull(message = "品类ID不能为空")
    private Long categoryId;

    @NotBlank(message = "材料名称不能为空")
    private String materialName;

    private String materialCode;

    private String specification;

    private String unit;

    @NotNull(message = "数量不能为空")
    private BigDecimal quantity;

    @NotNull(message = "单价不能为空")
    private BigDecimal unitPrice;

    private String batchNo;

    private String supplier;

    private String warehouse;

    private String location;

    private LocalDateTime productionDate;

    private LocalDateTime expiryDate;

    private Integer moistureProofDays;

    private Integer inventoryStatus;

    private BigDecimal warningQuantity;

    private BigDecimal maxQuantity;

    private String remark;
}
