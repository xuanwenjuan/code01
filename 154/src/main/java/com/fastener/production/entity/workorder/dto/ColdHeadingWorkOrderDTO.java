package com.fastener.production.entity.workorder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ColdHeadingWorkOrderDTO {

    private Long id;

    @NotNull(message = "产品分类ID不能为空")
    private Long categoryId;

    @NotNull(message = "计划生产数量不能为空")
    private Integer planQuantity;

    private Long materialId;

    private BigDecimal materialUsage;

    private String workCenter;

    private String machineCode;

    private String operator;

    @NotNull(message = "计划开始日期不能为空")
    private LocalDate planStartDate;

    @NotNull(message = "计划完成日期不能为空")
    private LocalDate planEndDate;

    private Integer priority;

    private String processRemark;

    private String qualityStandard;

    private String remark;
}
