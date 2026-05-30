package com.foundry.impeller.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cost_accounting")
public class CostAccounting extends BaseEntity {

    @NotNull(message = "统计日期不能为空")
    private LocalDate statisticsDate;

    @NotNull(message = "产品分类ID不能为空")
    private Long productCategoryId;

    @NotNull(message = "产品分类名称不能为空")
    private String productCategoryName;

    @NotNull(message = "原料成本不能为空")
    @PositiveOrZero(message = "原料成本不能为负数")
    private BigDecimal rawMaterialCost;

    @NotNull(message = "砂料成本不能为空")
    @PositiveOrZero(message = "砂料成本不能为负数")
    private BigDecimal sandMaterialCost;

    @NotNull(message = "能耗成本不能为空")
    @PositiveOrZero(message = "能耗成本不能为负数")
    private BigDecimal energyCost;

    @NotNull(message = "人工成本不能为空")
    @PositiveOrZero(message = "人工成本不能为负数")
    private BigDecimal laborCost;

    @NotNull(message = "次品损耗成本不能为空")
    @PositiveOrZero(message = "次品损耗成本不能为负数")
    private BigDecimal defectiveCost;

    private BigDecimal totalCost;

    @NotNull(message = "生产数量不能为空")
    @PositiveOrZero(message = "生产数量不能为负数")
    private Integer productionQuantity;

    private String remark;
}
