package com.leathercraft.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderProcessDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;
    private String processType;
    private String remark;
    private List<MaterialUsageDTO> materials;
    private BigDecimal laborHours;
    private BigDecimal laborCost;
}
