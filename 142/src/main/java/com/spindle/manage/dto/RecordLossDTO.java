package com.spindle.manage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RecordLossDTO {

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotNull(message = "工序代码不能为空")
    private Integer processCode;

    @NotBlank(message = "损耗类型不能为空")
    private String lossType;

    @NotBlank(message = "物料名称不能为空")
    private String materialName;

    @NotNull(message = "损耗数量不能为空")
    private BigDecimal lossQuantity;

    @NotNull(message = "损耗金额不能为空")
    private BigDecimal lossAmount;

    private String remark;

}
