package com.hydraulic.piston.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductionOrderDTO {
    private Long id;

    private Long categoryId;

    @NotBlank(message = "活塞型号不能为空")
    private String pistonModel;

    @NotNull(message = "生产数量不能为空")
    private Integer quantity;

    private Long materialId;

    private String materialBatch;

    private BigDecimal materialUsed;

    private LocalDateTime planStartTime;

    private LocalDateTime planEndTime;

    private String remark;
}
