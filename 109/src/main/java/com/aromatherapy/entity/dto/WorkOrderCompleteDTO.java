package com.aromatherapy.entity.dto;

import com.aromatherapy.validation.ValidPositiveNumber;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class WorkOrderCompleteDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotNull(message = "实际产量不能为空")
    @ValidPositiveNumber(message = "实际产量必须为正数")
    private BigDecimal actualQuantity;

    @NotBlank(message = "质检结果不能为空")
    private String qcResult;

    @ValidPositiveNumber(message = "人工成本必须为正数")
    private BigDecimal laborCost;
}
