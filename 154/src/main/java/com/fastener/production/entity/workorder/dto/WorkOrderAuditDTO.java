package com.fastener.production.entity.workorder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WorkOrderAuditDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotNull(message = "审核结果不能为空")
    private Integer auditStatus;

    @NotBlank(message = "审核意见不能为空")
    private String auditRemark;

    private Boolean autoReserveMaterial = true;
}
