package com.construction.material.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class InventoryInboundDetailDTO {

    @NotNull(message = "品类ID不能为空")
    private Long categoryId;

    private String materialName;

    private String materialCode;

    private String specification;

    private String unit;

    @NotNull(message = "入库数量不能为空")
    private BigDecimal quantity;

    @NotNull(message = "单价不能为空")
    private BigDecimal unitPrice;

    private LocalDateTime productionDate;

    private LocalDateTime expiryDate;

    private Integer moistureProofDays;

    private BigDecimal warningQuantity;

    private String location;

    private String remark;
}
