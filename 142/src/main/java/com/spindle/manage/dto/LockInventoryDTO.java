package com.spindle.manage.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LockInventoryDTO {

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotNull(message = "物料ID不能为空")
    private Long materialId;

    @NotNull(message = "锁定数量不能为空")
    private BigDecimal lockQuantity;

}
