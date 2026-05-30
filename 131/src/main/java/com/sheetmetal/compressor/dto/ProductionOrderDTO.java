package com.sheetmetal.compressor.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProductionOrderDTO {
    private Long id;

    @NotNull(message = "外壳分类ID不能为空")
    private Long categoryId;

    private String categoryName;

    @NotNull(message = "计划生产数量不能为空")
    private Integer planQuantity;

    private Integer actualQuantity = 0;

    private Integer defectiveQuantity = 0;

    private Integer status = 1;

    private LocalDate planStartDate;

    private LocalDate planEndDate;

    private Long processEngineerId;

    private String processEngineerName;

    private Long productionLeaderId;

    private String productionLeaderName;

    private Long inspectorId;

    private String inspectorName;

    private Integer priority = 0;

    private String remark;
}
