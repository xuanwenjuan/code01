package com.aluminum.extrusion.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_cost")
public class ProductionCost extends BaseEntity {

    private Long workOrderId;

    private String orderNo;

    private Long categoryId;

    private String categoryName;

    @NotNull(message = "原料成本不能为空")
    @DecimalMin(value = "0", message = "原料成本不能小于0")
    @DecimalMax(value = "999999.99", message = "原料成本超出范围")
    private BigDecimal materialCost;

    @NotNull(message = "模具成本不能为空")
    @DecimalMin(value = "0", message = "模具成本不能小于0")
    @DecimalMax(value = "999999.99", message = "模具成本超出范围")
    private BigDecimal moldCost;

    @NotNull(message = "能耗成本不能为空")
    @DecimalMin(value = "0", message = "能耗成本不能小于0")
    @DecimalMax(value = "999999.99", message = "能耗成本超出范围")
    private BigDecimal energyCost;

    @NotNull(message = "人工成本不能为空")
    @DecimalMin(value = "0", message = "人工成本不能小于0")
    @DecimalMax(value = "999999.99", message = "人工成本超出范围")
    private BigDecimal laborCost;

    @NotNull(message = "报废损失不能为空")
    @DecimalMin(value = "0", message = "报废损失不能小于0")
    @DecimalMax(value = "999999.99", message = "报废损失超出范围")
    private BigDecimal scrapCost;

    private BigDecimal totalCost;

    @NotNull(message = "产值不能为空")
    @DecimalMin(value = "0", message = "产值不能小于0")
    @DecimalMax(value = "999999.99", message = "产值超出范围")
    private BigDecimal outputValue;

    private BigDecimal profit;
}
