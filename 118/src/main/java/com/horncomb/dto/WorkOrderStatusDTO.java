package com.horncomb.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class WorkOrderStatusDTO {
    @NotNull(message = "工单ID不能为空")
    private Long id;

    private String status;

    private Integer passQuantity;

    private Integer failQuantity;

    private BigDecimal workHours;
}
