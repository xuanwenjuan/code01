package com.gear.mfg.dto;

import lombok.Data;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;

@Data
public class ProductionReportSubmitDTO {

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotNull(message = "工序号不能为空")
    private Integer processNo;

    @NotNull(message = "报工数量不能为空")
    @Min(value = 0, message = "报工数量不能小于0")
    private BigDecimal reportQuantity;

    @NotNull(message = "良品数量不能为空")
    @Min(value = 0, message = "良品数量不能小于0")
    private BigDecimal goodQuantity;

    @NotNull(message = "不良品数量不能为空")
    @Min(value = 0, message = "不良品数量不能小于0")
    private BigDecimal badQuantity;

    private String badReason;

    @NotNull(message = "实际工时不能为空")
    @Min(value = 0, message = "实际工时不能小于0")
    private BigDecimal actualHours;

    private String operator;

    private String remark;
}
