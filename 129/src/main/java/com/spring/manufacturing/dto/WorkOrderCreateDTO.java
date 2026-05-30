package com.spring.manufacturing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class WorkOrderCreateDTO {

    @NotNull(message = "产品分类ID不能为空")
    private Long categoryId;

    @NotBlank(message = "产品名称不能为空")
    private String productName;

    private String specification;

    @NotNull(message = "计划数量不能为空")
    @Positive(message = "计划数量必须大于0")
    private Integer planQuantity;

    private LocalDate planStartDate;

    private LocalDate planEndDate;

    private Integer priority;

    private List<MaterialRequirementDTO> materialRequirements;

    private String remark;
}