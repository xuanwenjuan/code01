package com.camping.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class StockLossRegisterDTO {

    @NotNull(message = "订单ID不能为空")
    private Long orderId;

    @NotBlank(message = "损耗原因不能为空")
    private String lossReason;

    @NotEmpty(message = "损耗明细不能为空")
    private List<LossItem> items;

    @Data
    public static class LossItem {
        @NotNull(message = "物料ID不能为空")
        private Long materialId;

        @NotNull(message = "损耗数量不能为空")
        private BigDecimal lossQuantity;

        private Integer lossType;

        private String remark;
    }
}
