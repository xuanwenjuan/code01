package com.mushroom.traceability.dto;

import com.mushroom.traceability.annotation.NotZero;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class HarvestDetailDTO {
    @NotNull(message = "任务ID不能为空")
    private Long taskId;
    @NotNull(message = "品类ID不能为空")
    private Long categoryId;
    private String categoryName;
    @NotZero(message = "采收数量必须大于0")
    private BigDecimal harvestQuantity;
    private BigDecimal lossQuantity;
    private String qualityLevel;
    private String harvestLocation;
    private LocalDateTime harvestTime;
    private String harvesterRemark;
}