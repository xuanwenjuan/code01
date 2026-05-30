package com.snacktrace.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CostStatisticsDTO {
    private Long categoryId;
    private LocalDate startDate;
    private LocalDate endDate;
}
