package com.construction.embedded.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderMaterialLockDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    private String remark;

    @NotEmpty(message = "原料列表不能为空")
    private List<MaterialLockItem> materialItems;

    @Data
    public static class MaterialLockItem {
        @NotNull(message = "原料ID不能为空")
        private Long materialId;

        @NotNull(message = "锁定数量不能为空")
        private BigDecimal lockedQuantity;
    }
}
