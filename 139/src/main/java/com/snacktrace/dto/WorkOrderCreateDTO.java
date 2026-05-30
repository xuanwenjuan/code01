package com.snacktrace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorkOrderCreateDTO {
    @NotNull(message = "产品ID不能为空")
    private Long productId;

    @NotBlank(message = "产品名称不能为空")
    private String productName;

    @NotNull(message = "计划生产数量不能为空")
    private BigDecimal planQuantity;

    private Integer priority;
    private Long teamLeaderId;
    private LocalDateTime planStartTime;
    private String remark;

    private List<WorkOrderMaterialDTO> materials;
}
