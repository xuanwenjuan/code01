package com.fitness.manufacture.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WorkOrderProcessDTO {

    private Long id;

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotBlank(message = "工序编码不能为空")
    private String processCode;

    @NotBlank(message = "工序名称不能为空")
    private String processName;

    private Integer processOrder;

    private Long operatorId;

    private String operatorName;

    private String remark;
}
