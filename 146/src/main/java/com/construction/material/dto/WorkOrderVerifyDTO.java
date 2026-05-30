package com.construction.material.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class WorkOrderVerifyDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @Valid
    @NotNull(message = "核销明细不能为空")
    private List<WorkOrderVerifyDetailDTO> details;

    private String remark;
}
