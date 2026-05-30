package com.household.management.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.household.management.common.entity.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cost_statistics")
@Schema(description = "成本统计实体")
public class CostStatistics extends BaseEntity {

    @Schema(description = "统计月份：yyyy-MM")
    private String statisticsMonth;

    @Schema(description = "原材料成本")
    private BigDecimal materialCost;

    @Schema(description = "设备损耗成本")
    private BigDecimal equipmentCost;

    @Schema(description = "人工工时成本")
    private BigDecimal laborCost;

    @Schema(description = "包装物料成本")
    private BigDecimal packagingCost;

    @Schema(description = "次品报废成本")
    private BigDecimal defectiveCost;

    @Schema(description = "其他成本")
    private BigDecimal otherCost;

    @Schema(description = "总成本")
    private BigDecimal totalCost;

    @Schema(description = "销售收入")
    private BigDecimal salesRevenue;

    @Schema(description = "毛利润")
    private BigDecimal grossProfit;

    @Schema(description = "毛利率(%)")
    private BigDecimal grossMargin;
}
