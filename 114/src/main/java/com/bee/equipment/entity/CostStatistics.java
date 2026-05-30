package com.bee.equipment.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("cost_statistics")
public class CostStatistics {

    private Long id;

    private LocalDate statisticsDate;

    private Long equipmentCategoryId;

    private BigDecimal materialCost;

    private BigDecimal laborCost;

    private BigDecimal transportCost;

    private BigDecimal totalCost;

    private BigDecimal salesRevenue;

    private BigDecimal profit;

    private Integer productionQuantity;

    private LocalDateTime createTime;
}
