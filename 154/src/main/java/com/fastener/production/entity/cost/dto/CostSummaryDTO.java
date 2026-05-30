package com.fastener.production.entity.cost.dto;

import lombok.Data;

@Data
public class CostSummaryDTO {

    private String startDate;

    private String endDate;

    private Long categoryId;

    private Long workOrderId;

    private Integer costType;
}
