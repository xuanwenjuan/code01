package com.gearbox.manage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkProcessDTO {
    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotBlank(message = "工序名称不能为空")
    private String processName;

    @NotBlank(message = "工序编号不能为空")
    private String processCode;

    private Integer processOrder;

    private String machineCode;

    private BigDecimal toolCost;

    private BigDecimal machineCost;

    private BigDecimal laborHours;

    private String remark;
}
