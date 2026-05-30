package com.plastic.injection.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductionOrderDTO {

    private Long id;

    @NotBlank(message = "产品名称不能为空")
    @Size(max = 100, message = "产品名称长度不能超过100")
    private String productName;

    private Long productId;

    @NotNull(message = "产品类目不能为空")
    private Long categoryId;

    private String categoryName;

    @NotNull(message = "计划数量不能为空")
    @DecimalMin(value = "0.01", message = "计划数量必须大于0")
    private BigDecimal planQuantity;

    @NotNull(message = "计划开始时间不能为空")
    private LocalDateTime planStartTime;

    private LocalDateTime planEndTime;

    @NotNull(message = "技术员不能为空")
    private Long technicianId;

    private String technicianName;

    @NotNull(message = "机台不能为空")
    private Long machineId;

    private String machineName;

    private Integer dryingTime;

    private Integer moldInstallTime;

    private Integer injectionCycle;

    private Integer coolingTime;

    private Integer trimmingTime;

    private String remark;

    @Valid
    @NotEmpty(message = "工单原料不能为空")
    private List<OrderMaterialDTO> materials;
}
