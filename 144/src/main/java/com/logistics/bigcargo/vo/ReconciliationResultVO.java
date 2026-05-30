package com.logistics.bigcargo.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ReconciliationResultVO {
    private String period;

    private BigDecimal systemTotal;

    private BigDecimal expectedTotal;

    private BigDecimal difference;

    private List<LogisticsCost> differenceDetails;

    private String reconciliationStatus;

    private String reconciliationResult;
}
