package com.fan.impeller.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WorkOrderQueryDTO {
    @Size(max = 100, message = "工单号长度不能超过100")
    private String orderNo;

    @Size(max = 100, message = "产品名称长度不能超过100")
    private String productName;

    private Integer status;

    private Integer currentStep;

    private Long operatorId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;
}
