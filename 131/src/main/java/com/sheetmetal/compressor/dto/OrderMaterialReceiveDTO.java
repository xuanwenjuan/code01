package com.sheetmetal.compressor.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderMaterialReceiveDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotEmpty(message = "原料列表不能为空")
    private List<ReceiveItem> items;

    private String remark;

    @Data
    public static class ReceiveItem {
        @NotNull(message = "原料ID不能为空")
        private Long materialId;

        @NotNull(message = "领用数量不能为空")
        private BigDecimal receiveQuantity;
    }
}
