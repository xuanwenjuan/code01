package com.flange.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductionLossDto {
    private Long id;

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @Size(max = 30, message = "工序步骤长度不能超过30")
    private String processStep;

    @NotBlank(message = "损耗类型不能为空")
    @Size(max = 20, message = "损耗类型长度不能超过20")
    private String lossType;

    @NotNull(message = "损耗数量不能为空")
    @DecimalMin(value = "0.01", message = "损耗数量必须大于0")
    private BigDecimal lossQuantity;

    private BigDecimal unitPrice;

    @Size(max = 500, message = "损耗原因长度不能超过500")
    private String lossReason;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}
