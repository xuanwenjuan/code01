package com.textile.production.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProcessCompleteDTO {

    @NotNull(message = "工序ID不能为空")
    private Long processId;

    @NotNull(message = "产出数量不能为空")
    private BigDecimal outputQuantity;

    private BigDecimal defectiveQuantity = BigDecimal.ZERO;

    private String equipment;

    private String remark;
}
