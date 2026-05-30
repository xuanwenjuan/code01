package com.construction.material.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WorkOrderAuditDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotNull(message = "审核状态不能为空")
    private Integer status;

    private String auditRemark;
}
