package com.paper.production.entity.cost;

import com.baomidou.mybatisplus.annotation.TableName;
import com.paper.production.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("monthly_report")
public class MonthlyReport extends BaseEntity {

    private String reportMonth;
    private BigDecimal totalMaterialCost;
    private BigDecimal totalEquipmentCost;
    private BigDecimal totalUtilityCost;
    private BigDecimal totalLaborCost;
    private BigDecimal totalScrapCost;
    private BigDecimal totalCost;
    private BigDecimal totalOutputQuantity;
    private Integer finishedOrderCount;
    private Integer totalOrderCount;
    private String remark;
}
