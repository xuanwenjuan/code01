package com.mushroom.traceability.dto;

import com.mushroom.traceability.annotation.NotZero;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class WarehouseInDTO {
    @NotNull(message = "任务ID不能为空")
    private Long taskId;
    @Valid
    private List<HarvestItemDTO> items;
    private String qualityRemark;
}