package com.household.management.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.household.management.common.entity.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("monthly_production_sales_report")
@Schema(description = "月度产销报表实体")
public class MonthlyProductionSalesReport extends BaseEntity {

    @Schema(description = "报表月份")
    private String reportMonth;

    @Schema(description = "生产数量")
    private Integer productionQuantity;

    @Schema(description = "销售数量")
    private Integer salesQuantity;

    @Schema(description = "产值")
    private BigDecimal productionValue;

    @Schema(description = "销售额")
    private BigDecimal salesValue;

    @Schema(description = "总成本")
    private BigDecimal totalCost;

    @Schema(description = "净利润")
    private BigDecimal netProfit;

    @Schema(description = "利润率(%)")
    private BigDecimal profitMargin;

    @Schema(description = "状态：1-草稿 2-已确认")
    private Integer status;
}
