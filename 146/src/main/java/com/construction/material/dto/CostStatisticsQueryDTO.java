package com.construction.material.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CostStatisticsQueryDTO {

    private String projectName;

    private Integer statisticsType;

    private LocalDateTime startDate;

    private LocalDateTime endDate;
}
