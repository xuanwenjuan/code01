package com.hardware.stamping.dto;

import com.hardware.stamping.common.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
public class CostAccountingQueryDTO extends PageQuery {
    private Long categoryId;
    private Long orderId;
    private LocalDate startDate;
    private LocalDate endDate;
}
