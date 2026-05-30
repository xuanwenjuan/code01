package com.sheetmetal.compressor.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("production_cost")
public class ProductionCost {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String costNo;
    private Long categoryId;
    private String categoryName;
    private Long orderId;
    private String orderNo;
    private Integer productionQuantity;
    private BigDecimal materialCost;
    private BigDecimal equipmentCost;
    private BigDecimal sprayCost;
    private BigDecimal laborCost;
    private BigDecimal defectiveCost;
    private BigDecimal otherCost;
    private BigDecimal totalCost;
    private BigDecimal unitCost;
    private LocalDate costDate;
    private String quarter;
    private String remark;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;
    @TableLogic
    private Integer deleted;
}
