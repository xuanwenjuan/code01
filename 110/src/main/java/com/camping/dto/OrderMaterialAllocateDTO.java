package com.camping.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderMaterialAllocateDTO {

    @NotNull(message = "订单ID不能为空")
    private Long orderId;

    @NotEmpty(message = "物料列表不能为空")
    private List<MaterialItem> materials;

    @Data
    public static class MaterialItem {
        @NotNull(message = "物料ID不能为空")
        private Long materialId;

        private String materialName;

        @NotNull(message = "物料数量不能为空")
        private BigDecimal quantity;

        private BigDecimal unitPrice;

        private String remark;
    }
}
