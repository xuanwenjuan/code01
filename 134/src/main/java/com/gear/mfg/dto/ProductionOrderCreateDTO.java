package com.gear.mfg.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;

@Data
public class ProductionOrderCreateDTO {

    @NotBlank(message = "工单编号不能为空")
    private String orderNo;

    @NotNull(message = "类目ID不能为空")
    private Long categoryId;

    @NotBlank(message = "齿轮型号不能为空")
    private String gearModel;

    @NotNull(message = "生产数量不能为空")
    @Min(value = 1, message = "生产数量不能小于1")
    private BigDecimal quantity;

    @NotNull(message = "BOM ID不能为空")
    private Long bomId;

    @NotNull(message = "工艺路线ID不能为空")
    private Long routeId;

    private String remark;
}
