package com.firecontrol.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorkOrderDTO {

    private Long id;

    @NotNull(message = "产品ID不能为空")
    private Long productId;

    @NotNull(message = "计划数量不能为空")
    private BigDecimal planQuantity;

    @NotNull(message = "计划开始时间不能为空")
    private LocalDateTime planStartTime;

    @NotNull(message = "计划结束时间不能为空")
    private LocalDateTime planEndTime;

    private Integer priority;

    private Integer isEmergency;

    private String remark;

    private List<WorkOrderMaterialDTO> materials;
}
