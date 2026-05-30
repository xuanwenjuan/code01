package com.construction.material.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderDetailDTO {

    private Long id;

    @NotNull(message = "库存ID不能为空")
    private Long inventoryId;

    private Long categoryId;

    private String categoryName;

    private String materialName;

    private String specification;

    private String unit;

    @NotNull(message = "计划数量不能为空")
    private BigDecimal planQuantity;

    private BigDecimal unitPrice;

    private String batchNo;

    private String remark;
}
