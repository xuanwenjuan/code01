package com.rotor.manufacture.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductionOrderCreateDTO {
    @NotNull(message = "产品ID不能为空")
    private Long productId;

    @NotBlank(message = "产品名称不能为空")
    private String productName;

    @NotNull(message = "生产数量不能为空")
    @Positive(message = "生产数量必须为正数")
    private Integer quantity;

    @NotNull(message = "计划开始时间不能为空")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime planStartTime;

    @NotNull(message = "计划结束时间不能为空")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime planEndTime;

    private String remark;

    private List<MaterialRequirementDTO> materialRequirements;

    @Data
    public static class MaterialRequirementDTO {
        @NotNull(message = "原料ID不能为空")
        private Long materialId;

        @NotBlank(message = "原料名称不能为空")
        private String materialName;

        @NotNull(message = "需求数量不能为空")
        @Positive(message = "需求数量必须为正数")
        private BigDecimal quantity;
    }
}