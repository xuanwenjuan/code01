package com.horncomb.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class WorkOrderDTO {
    private Long id;

    @NotNull(message = "梳型类目不能为空")
    private Long categoryId;

    @NotNull(message = "原料ID不能为空")
    private Long materialId;

    @NotNull(message = "生产数量不能为空")
    @Min(value = 1, message = "生产数量至少为1")
    private Integer productionQuantity;

    @DecimalMin(value = "0", message = "用料重量不能小于0")
    private BigDecimal materialUsage;

    private Long craftsmanId;

    @DecimalMin(value = "0", message = "工时不能小于0")
    private BigDecimal workHours;

    @DecimalMin(value = "0", message = "工时费单价不能小于0")
    private BigDecimal hourlyWage;

    @DecimalMin(value = "0", message = "耗材成本不能小于0")
    private BigDecimal consumableCost;

    @Size(max = 500, message = "备注长度不能超过500")
    private String remark;
}
