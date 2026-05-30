package com.construction.material.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CostReconciliationDTO {

    private String projectName;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private BigDecimal systemTotalAmount;

    private BigDecimal actualTotalAmount;

    private BigDecimal difference;

    private String remark;
}
