package com.fan.impeller.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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

    @NotNull(message = "生产数量不能为空")
    private BigDecimal quantity;

    private LocalDateTime planStartTime;

    private LocalDateTime planEndTime;

    private String remark;

    @NotEmpty(message = "原料清单不能为空")
    @Valid
    private List<WorkOrderMaterialDTO> materials;

    @Data
    public static class WorkOrderMaterialDTO {
        @NotNull(message = "原料ID不能为空")
        private Long materialId;

        @NotBlank(message = "原料名称不能为空")
        private String materialName;

        @NotBlank(message = "批次号不能为空")
        private String batchNo;

        @NotNull(message = "数量不能为空")
        private BigDecimal quantity;

        @NotBlank(message = "单位不能为空")
        private String unit;

        @NotNull(message = "单价不能为空")
        private BigDecimal unitPrice;
    }
}
