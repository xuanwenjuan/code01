package com.textile.production.dto;

import com.textile.production.annotation.BigDecimalRange;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class ProductionOrderDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    @NotNull(message = "面料分类ID不能为空")
    private Long categoryId;

    @NotBlank(message = "面料名称不能为空")
    private String fabricName;

    @NotNull(message = "计划生产数量不能为空")
    @BigDecimalRange(min = "0", allowZero = false, message = "计划生产数量必须大于0")
    private BigDecimal planQuantity;

    @NotBlank(message = "计量单位不能为空")
    private String unit;

    private Integer priority = 0;

    private LocalDate planStartDate;

    private LocalDate planEndDate;

    private Long operatorId;

    private String remark;

    private List<OrderMaterialDTO> materials;
}
