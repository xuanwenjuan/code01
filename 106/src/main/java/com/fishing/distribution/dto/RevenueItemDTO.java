package com.fishing.distribution.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RevenueItemDTO {

    @NotBlank(message = "收支类型不能为空")
    @Pattern(regexp = "^(IN|OUT)$", message = "收支类型只能是IN或OUT")
    private String itemType;

    @NotBlank(message = "收支类别不能为空")
    @Pattern(regexp = "^(SALES|COLD_CHAIN|LABOR|OTHER)$", message = "收支类别不合法")
    private String itemCategory;

    @Min(value = 1, message = "工单ID不合法")
    private Long orderId;

    private String orderNo;

    @NotNull(message = "金额不能为空")
    @DecimalMin(value = "0.01", message = "金额必须大于0")
    @DecimalMax(value = "99999999.99", message = "金额超出范围")
    private BigDecimal amount;

    @Size(max = 100, message = "付款方/收款方长度不能超过100字符")
    private String payerPayee;

    @Size(max = 500, message = "备注长度不能超过500字符")
    private String remark;
}
