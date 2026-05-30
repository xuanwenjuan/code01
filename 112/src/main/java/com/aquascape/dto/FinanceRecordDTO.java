package com.aquascape.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class FinanceRecordDTO {
    private Long id;

    @NotNull(message = "记录类型不能为空")
    private Integer recordType;

    private Long categoryId;

    @Size(max = 100, message = "分类名称长度不能超过100")
    private String categoryName;

    @NotNull(message = "金额不能为空")
    @Positive(message = "金额必须大于0")
    private BigDecimal amount;

    private Long relatedOrderId;

    private String relatedOrderNo;

    private LocalDate recordDate;

    @Size(max = 50, message = "操作人长度不能超过50")
    private String operator;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}
