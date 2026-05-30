package com.sheetmetal.compressor.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class MaterialLockDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotEmpty(message = "原料列表不能为空")
    private List<LockItem> items;

    private String remark;

    @Data
    public static class LockItem {
        @NotNull(message = "原料ID不能为空")
        private Long materialId;

        @NotNull(message = "锁定数量不能为空")
        private BigDecimal lockQuantity;
    }
}
