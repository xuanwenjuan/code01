package com.horncomb.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProfitLedgerDTO {
    private Long id;

    @NotNull(message = "梳型类目不能为空")
    private Long categoryId;

    @NotBlank(message = "统计月份不能为空")
    @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "统计月份格式必须为YYYY-MM")
    private String statisticalMonth;

    @Min(value = 0, message = "生产数量不能小于0")
    private Integer productionQuantity;

    @Min(value = 0, message = "销售数量不能小于0")
    private Integer salesQuantity;

    @DecimalMin(value = "0", message = "原料成本不能小于0")
    private BigDecimal materialCost;

    @DecimalMin(value = "0", message = "耗材成本不能小于0")
    private BigDecimal consumableCost;

    @DecimalMin(value = "0", message = "人工成本不能小于0")
    private BigDecimal laborCost;

    @DecimalMin(value = "0", message = "销售收入不能小于0")
    private BigDecimal salesRevenue;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}
