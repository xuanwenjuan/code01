package com.snack.processing.dto.stockcheck;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

import java.math.BigDecimal;

@Data
public class StockCheckDetailDTO {

    @NotNull(message = "材料ID不能为空")
    private Long materialId;

    private String materialName;
    private String materialCode;
    private String batchNo;

    @NotNull(message = "系统数量不能为空")
    private BigDecimal systemQuantity;

    @NotNull(message = "实际数量不能为空")
    private BigDecimal actualQuantity;

    private BigDecimal differenceQuantity;
    private BigDecimal unitPrice;
    private BigDecimal differenceAmount;

    @Length(max = 500, message = "差异原因长度不能超过500")
    private String reason;

    @Length(max = 500, message = "备注长度不能超过500")
    private String remark;
}
