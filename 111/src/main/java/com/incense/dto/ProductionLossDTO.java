package com.incense.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductionLossDTO {

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    @NotBlank(message = "批次编码不能为空")
    @Size(max = 50, message = "批次编码长度不能超过50")
    private String batchCode;

    @NotBlank(message = "损耗类型不能为空")
    @Size(max = 50, message = "损耗类型长度不能超过50")
    private String lossType;

    @NotNull(message = "损耗数量不能为空")
    private BigDecimal lossQuantity;

    @Size(max = 500, message = "损耗原因长度不能超过500")
    private String lossReason;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}
