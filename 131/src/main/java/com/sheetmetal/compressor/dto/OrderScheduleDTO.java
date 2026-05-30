package com.sheetmetal.compressor.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class OrderScheduleDTO {
    @NotNull(message = "工单ID不能为空")
    private Long id;

    @NotNull(message = "工艺员ID不能为空")
    private Long engineerId;

    @NotNull(message = "产线组长ID不能为空")
    private Long leaderId;

    @NotNull(message = "计划开始日期不能为空")
    private LocalDate startDate;

    @NotNull(message = "计划结束日期不能为空")
    private LocalDate endDate;
}
