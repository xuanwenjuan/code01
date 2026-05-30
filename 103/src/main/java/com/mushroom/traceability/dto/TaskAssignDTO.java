package com.mushroom.traceability.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TaskAssignDTO {
    @NotNull(message = "任务ID不能为空")
    private Long taskId;
    @NotNull(message = "采收员ID不能为空")
    private Long harvesterId;
    private String harvesterName;
    @NotNull(message = "采收额度不能为空")
    private BigDecimal quota;
}