package com.fastener.production.entity.cost;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fastener.production.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("monthly_production_report")
public class MonthlyProductionReport extends BaseEntity {

    private String reportMonth;

    private Integer totalOrders;

    private Integer completedOrders;

    private Integer totalQuantity;

    private Integer totalScrapQuantity;

    private BigDecimal scrapRate;

    private BigDecimal totalMaterialCost;

    private BigDecimal totalMoldCost;

    private BigDecimal totalElectricityCost;

    private BigDecimal totalLaborCost;

    private BigDecimal totalScrapCost;

    private BigDecimal totalCost;

    private BigDecimal unitCost;

    private BigDecimal totalWorkingHours;

    private BigDecimal efficiency;

    private String remark;
}
