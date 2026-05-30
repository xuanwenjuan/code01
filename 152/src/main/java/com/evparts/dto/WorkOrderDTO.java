package com.evparts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class WorkOrderDTO {

    private Long id;

    @NotNull(message = "产品ID不能为空")
    private Long productId;

    @NotNull(message = "计划数量不能为空")
    private Integer planQuantity;

    private Integer priority = 0;

    @NotNull(message = "计划开始日期不能为空")
    private LocalDate planStartDate;

    @NotNull(message = "计划完成日期不能为空")
    private LocalDate planEndDate;

    private String workshop;

    private String line;

    private Long operatorId;

    private String remark;

    private List<WorkOrderMaterialDTO> materials;

}
