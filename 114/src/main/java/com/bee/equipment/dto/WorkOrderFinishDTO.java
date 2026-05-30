package com.bee.equipment.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class WorkOrderFinishDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotNull(message = "实际生产数量不能为空")
    private Integer actualQuantity;

    private String remark;

    @NotEmpty(message = "物料损耗明细不能为空")
    @Valid
    private List<MaterialLossDTO> materialLosses;
}
