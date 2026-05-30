package com.hydraulic.piston.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProcessCompleteDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotNull(message = "工序ID不能为空")
    private Integer processId;

    private Long processUserId;

    private String processUserName;
}
