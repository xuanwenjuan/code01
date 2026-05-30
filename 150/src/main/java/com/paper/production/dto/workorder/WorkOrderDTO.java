package com.paper.production.dto.workorder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorkOrderDTO {

    private Long id;

    @NotBlank(message = "工单名称不能为空")
    private String orderName;

    @NotNull(message = "产品分类ID不能为空")
    private Long productCategoryId;

    @NotBlank(message = "产品分类名称不能为空")
    private String productCategoryName;

    private String specification;

    @NotNull(message = "生产数量不能为空")
    private BigDecimal quantity;

    private LocalDateTime planStartTime;
    private LocalDateTime planEndTime;
    private String productionLine;
    private String supervisor;
    private Integer priority;
    private String customer;
    private String remark;

    private List<WorkOrderMaterialDTO> materials;
}
