package com.paper.production.dto.workorder;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderProcessDTO {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotNull(message = "工序类型不能为空")
    private Integer processType;

    private BigDecimal outputQuantity;
    private BigDecimal defectiveQuantity;
    private String equipment;
    private String operator;
    private String remark;
}
