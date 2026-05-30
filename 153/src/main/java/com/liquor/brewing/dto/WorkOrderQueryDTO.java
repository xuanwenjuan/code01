package com.liquor.brewing.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class WorkOrderQueryDTO {

    private String keyword;

    private Long categoryId;

    private Long formulaId;

    private Integer status;

    private Long brewerId;

    private Long supervisorId;

    private Long inspectorId;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer priority;
}
