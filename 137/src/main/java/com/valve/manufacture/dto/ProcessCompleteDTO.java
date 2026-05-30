package com.valve.manufacture.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProcessCompleteDTO {

    @NotNull(message = "工序ID不能为空")
    private Long processId;

    @PositiveOrZero(message = "工时不能为负数")
    private BigDecimal workHours;

    private Integer qualifiedCount;

    private Integer unqualifiedCount;

    private Integer scrapCount;

    private String remark;
}
