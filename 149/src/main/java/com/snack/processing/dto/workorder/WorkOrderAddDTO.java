package com.snack.processing.dto.workorder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorkOrderAddDTO {

    @NotNull(message = "零食品类ID不能为空")
    private Long snackCategoryId;

    private String snackCategoryName;

    @NotBlank(message = "产品名称不能为空")
    private String productName;

    @NotNull(message = "计划产量不能为空")
    private BigDecimal planQuantity;

    private String unit;

    @NotNull(message = "计划开始时间不能为空")
    private LocalDateTime planStartTime;

    @NotNull(message = "计划结束时间不能为空")
    private LocalDateTime planEndTime;

    private Integer priority;

    private Long processEnginnerId;

    private String processEnginnerName;

    private Long productionLeaderId;

    private String productionLeaderName;

    private Long qcInspectorId;

    private String qcInspectorName;

    private String remark;

    private List<WorkOrderMaterialDTO> materials;
}
