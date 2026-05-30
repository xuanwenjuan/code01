package com.ancientpaper.dto;

import com.ancientpaper.validation.CreateGroup;
import com.ancientpaper.validation.UpdateGroup;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class FinanceLedgerDTO {

    @NotNull(message = "台账ID不能为空", groups = UpdateGroup.class)
    @Positive(message = "台账ID必须大于0", groups = UpdateGroup.class)
    private Long id;

    @NotNull(message = "纸品分类不能为空", groups = CreateGroup.class)
    @Positive(message = "纸品分类ID必须大于0", groups = {CreateGroup.class, UpdateGroup.class})
    private Long categoryId;

    private Long orderId;

    @PositiveOrZero(message = "草料采购费用不能为负")
    private BigDecimal materialCost = BigDecimal.ZERO;

    @PositiveOrZero(message = "人力沤制成本不能为负")
    private BigDecimal laborCost = BigDecimal.ZERO;

    @PositiveOrZero(message = "抄造工时开销不能为负")
    private BigDecimal workHourCost = BigDecimal.ZERO;

    @PositiveOrZero(message = "线下订单营收不能为负")
    private BigDecimal salesRevenue = BigDecimal.ZERO;

    @PositiveOrZero(message = "生产数量不能为负")
    private BigDecimal productionQuantity;

    @PositiveOrZero(message = "销售数量不能为负")
    private BigDecimal salesQuantity;

    private LocalDate statDate;

    @Size(max = 500, message = "备注长度不能超过500字符")
    private String remarks;
}
