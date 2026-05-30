package com.gearbox.manage.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProcessCompleteDTO {
    @NotNull(message = "工序ID不能为空")
    private Long processId;

    private BigDecimal workHours;

    private BigDecimal machineHours;

    private BigDecimal toolUsage;

    private String remark;
}
