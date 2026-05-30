package com.sheetmetal.compressor.dto;

import com.sheetmetal.compressor.common.PageQuery;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
public class ProductionLossDTO extends PageQuery {
    private Long id;

    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotNull(message = "损耗类型不能为空")
    private Integer lossType;

    @NotBlank(message = "损耗名称不能为空")
    private String lossName;

    private BigDecimal lossQuantity;

    @NotNull(message = "损耗金额不能为空")
    private BigDecimal lossAmount;

    private BigDecimal lossRate;

    private BigDecimal unitPrice;

    private String remark;
}
