package com.amber.polish.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PolishOrderDTO {

    @NotNull(message = "原石ID不能为空")
    private Long rawStoneId;

    @NotBlank(message = "客户姓名不能为空")
    private String customerName;

    @NotBlank(message = "客户电话不能为空")
    private String customerPhone;

    private String designRequirements;

    private Long polisherId;

    @Positive(message = "耗材支出必须为正数")
    private BigDecimal materialCost;

    @Positive(message = "人工费用必须为正数")
    private BigDecimal laborCost;

    @Positive(message = "订单金额必须为正数")
    private BigDecimal orderAmount;

    private String remark;
}
