package com.valve.manufacture.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class WorkOrderCreateDTO {

    @NotBlank(message = "产品名称不能为空")
    private String productName;

    @NotNull(message = "产品分类ID不能为空")
    private Long productCategoryId;

    @NotNull(message = "生产数量不能为空")
    @Positive(message = "生产数量必须大于0")
    private Integer quantity;

    private Integer priority;

    @NotNull(message = "计划开始日期不能为空")
    private LocalDate planStartDate;

    private LocalDate planEndDate;

    private Long assigneeId;

    private List<WorkOrderMaterialDTO> materials;

    private String remark;
}
