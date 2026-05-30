package com.ancientpaper.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("production_cost")
public class ProductionCost {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long orderId;
    private Long categoryId;
    private BigDecimal materialCost;
    private BigDecimal laborCost;
    private BigDecimal workHourCost;
    private BigDecimal waterCost;
    private BigDecimal energyCost;
    private BigDecimal equipmentLoss;
    private BigDecimal wasteRate;
    private BigDecimal totalCost;
    private BigDecimal unitCost;
    private BigDecimal productionQuantity;
    private String remarks;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
