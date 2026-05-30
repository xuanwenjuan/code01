package com.snacktrace.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
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
    private Long workOrderId;
    private Long productId;
    private Long categoryId;
    private BigDecimal materialCost;
    private BigDecimal equipmentCost;
    private BigDecimal packagingCost;
    private BigDecimal laborCost;
    private BigDecimal defectCost;
    private BigDecimal totalCost;
    private LocalDate costDate;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    @TableLogic
    private Integer deleted;
}
