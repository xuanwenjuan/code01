package com.fitness.manufacture.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WorkOrderDTO {

    private Long id;

    @NotNull(message = "产品ID不能为空")
    private Long productId;

    private String productName;

    @NotNull(message = "计划数量不能为空")
    private Integer planQuantity;

    private Integer priority;

    private LocalDateTime planStartTime;

    private LocalDateTime planEndTime;

    private Long lineLeaderId;

    private String lineLeaderName;

    private String remark;
}
