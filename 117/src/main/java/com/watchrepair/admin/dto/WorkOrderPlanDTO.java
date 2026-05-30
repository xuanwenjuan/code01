package com.watchrepair.admin.dto;

import com.watchrepair.admin.entity.WorkOrderPart;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class WorkOrderPlanDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotNull(message = "配件选配员ID不能为空")
    private Long partsSelectorId;

    @NotEmpty(message = "配件列表不能为空")
    @Valid
    private List<WorkOrderPart> parts;

    private BigDecimal laborCost;

    private BigDecimal appearanceCost;

    private String remarks;
}