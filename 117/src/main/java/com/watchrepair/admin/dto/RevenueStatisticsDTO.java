package com.watchrepair.admin.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class RevenueStatisticsDTO {

    private Long categoryId;

    private LocalDate startDate;

    private LocalDate endDate;
}