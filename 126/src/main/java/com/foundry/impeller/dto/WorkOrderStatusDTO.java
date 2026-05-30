package com.foundry.impeller.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class WorkOrderStatusDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    private String operationType;

    private String remark;

    private Integer actualQuantity;

    private Integer defectiveQuantity;

    private List<WorkOrderMaterialDTO> materials;
}
