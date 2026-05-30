package com.aluminum.extrusion.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WorkOrderQueryDTO {

    @Min(value = 1, message = "页码最小为1")
    private Integer current = 1;

    @Min(value = 1, message = "每页条数最小为1")
    private Integer size = 10;

    private Integer status;

    private Long categoryId;

    private String orderNo;

    private String alloyGrade;

    private LocalDateTime startTime;

    private LocalDateTime endTime;
}
