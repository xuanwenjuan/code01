package com.logistics.bigcargo.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ReconciliationDTO {
    private String startDate;

    private String endDate;

    private Long categoryId;

    private BigDecimal expectedAmount;

    private BigDecimal actualAmount;

    private String reconciliationRemark;
}
