package com.motor.core.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("production_cost")
public class ProductionCost {
    @TableId(type = IdType.AUTO)
    private Long id;
    private LocalDate costDate;
    private Long categoryId;
    private Long orderId;
    private BigDecimal materialCost;
    private BigDecimal materialWaste;
    private BigDecimal energyCost;
    private BigDecimal energyConsumption;
    private BigDecimal laborCost;
    private BigDecimal laborHours;
    private BigDecimal defectiveCost;
    private Integer defectiveQuantity;
    private BigDecimal totalCost;
    private Integer productionQuantity;
    private BigDecimal unitCost;
    private BigDecimal salePrice;
    private BigDecimal profit;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
