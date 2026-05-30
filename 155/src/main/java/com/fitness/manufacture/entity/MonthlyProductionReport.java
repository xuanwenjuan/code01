package com.fitness.manufacture.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fitness.manufacture.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("monthly_production_report")
public class MonthlyProductionReport extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String reportMonth;

    private Integer totalOrders;

    private Integer completedOrders;

    private Integer totalQuantity;

    private BigDecimal totalMaterialCost;

    private BigDecimal totalWeldingCost;

    private BigDecimal totalLaborCost;

    private BigDecimal totalEquipmentCost;

    private BigDecimal totalScrapCost;

    private BigDecimal totalCost;

    private BigDecimal totalSales;

    private BigDecimal grossProfit;

    private BigDecimal grossMargin;

    private Integer status;

    private LocalDateTime generateTime;

    private Long confirmBy;

    private LocalDateTime confirmTime;

    private String remark;
}
