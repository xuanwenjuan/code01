package com.flange.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class InventoryCheckDto {
    private Long id;

    @NotNull(message = "物料ID不能为空")
    private Long materialId;

    @NotNull(message = "实际盘点数量不能为空")
    @DecimalMin(value = "0", message = "实际盘点数量不能为负数")
    private BigDecimal actualQuantity;

    @Size(max = 500, message = "差异原因长度不能超过500")
    private String diffReason;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}
