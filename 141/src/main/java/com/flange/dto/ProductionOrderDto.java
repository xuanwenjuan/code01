package com.flange.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ProductionOrderDto {
    private Long id;

    private String orderNo;

    @NotNull(message = "法兰分类不能为空")
    private Long categoryId;

    @NotBlank(message = "规格型号不能为空")
    @Size(max = 200, message = "规格型号长度不能超过200")
    private String specification;

    @NotNull(message = "生产数量不能为空")
    @Min(value = 1, message = "生产数量必须大于0")
    @Max(value = 10000, message = "生产数量不能超过10000")
    private Integer quantity;

    @NotNull(message = "原料不能为空")
    private Long materialId;

    private BigDecimal requiredMaterial;

    @NotNull(message = "计划开始日期不能为空")
    private LocalDate planStartDate;

    @NotNull(message = "计划结束日期不能为空")
    private LocalDate planEndDate;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}
