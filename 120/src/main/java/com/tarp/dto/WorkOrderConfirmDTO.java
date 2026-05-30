package com.tarp.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
public class WorkOrderConfirmDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotEmpty(message = "用料明细不能为空")
    @Valid
    private List<MaterialItemDTO> materials;

    @Data
    public static class MaterialItemDTO implements Serializable {
        @NotNull(message = "材料ID不能为空")
        private Long materialId;

        private String materialName;

        @NotNull(message = "使用数量不能为空")
        @Positive(message = "使用数量必须大于0")
        private BigDecimal usageQuantity;

        private BigDecimal unitPrice;

        private BigDecimal totalPrice;
    }
}
