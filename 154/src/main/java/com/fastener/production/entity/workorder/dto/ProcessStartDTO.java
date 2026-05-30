package com.fastener.production.entity.workorder.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProcessStartDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotNull(message = "工序编码不能为空")
    private String processCode;

    private String operator;

    private String workCenter;

    private String machineCode;

    private Integer inputQuantity;

    private String processParams;
}
