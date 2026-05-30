package com.paper.production.dto.workorder;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class WorkOrderConfirmDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotEmpty(message = "用料清单不能为空")
    private List<WorkOrderMaterialItem> materials;
}
