package com.mushroom.traceability.dto;

import com.mushroom.traceability.annotation.NotZero;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class HarvestTaskCreateDTO {
    @NotBlank(message = "任务名称不能为空")
    private String taskName;
    @NotNull(message = "产区ID不能为空")
    private Long areaId;
    private String taskDescription;
    @NotZero(message = "预计采收量必须大于0")
    private BigDecimal expectedQuantity;
    @NotNull(message = "任务失效时间不能为空")
    private LocalDateTime expireTime;
    private List<Long> categoryIds;
}