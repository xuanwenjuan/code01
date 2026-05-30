package com.snacktrace.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WorkOrderQueryDTO {
    private String orderNo;
    private Long productId;
    private Integer status;
    private Long teamLeaderId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Min(value = 1, message = "页码最小为1")
    private Integer page = 1;

    @Min(value = 1, message = "每页条数最小为1")
    private Integer size = 10;
}
