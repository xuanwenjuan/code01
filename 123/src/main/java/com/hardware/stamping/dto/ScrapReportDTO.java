package com.hardware.stamping.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ScrapReportDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotNull(message = "报废数量不能为空")
    private BigDecimal scrapQuantity;

    private String scrapReason;

    private String remark;
}
