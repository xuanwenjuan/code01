package com.heritage.dye.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderStepDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotNull(message = "工序号不能为空")
    private Integer stepNo;

    @DecimalMin(value = "0", message = "工序损耗不能小于0")
    @DecimalMax(value = "999999.99", message = "工序损耗不能超过999999.99")
    private BigDecimal stepLoss;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}
