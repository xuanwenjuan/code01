package com.construction.embedded.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProductionOrderDTO {
    private Long id;

    private String orderNo;

    @NotNull(message = "产品分类ID不能为空")
    private Long categoryId;

    @NotBlank(message = "产品名称不能为空")
    private String productName;

    private String specification;

    @NotNull(message = "计划生产数量不能为空")
    @Positive(message = "计划生产数量必须大于0")
    private Integer planQuantity;

    private Integer actualQuantity;

    private Integer defectiveQuantity;

    private String status;

    @NotNull(message = "计划开始时间不能为空")
    private LocalDateTime planStartTime;

    private LocalDateTime actualStartTime;

    private LocalDateTime finishTime;

    @Positive(message = "超期时间必须大于0")
    private Integer timeoutHours;

    private String remark;

    private Long createBy;
}
