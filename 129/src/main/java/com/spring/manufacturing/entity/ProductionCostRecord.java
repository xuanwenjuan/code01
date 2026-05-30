package com.spring.manufacturing.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("production_cost_record")
public class ProductionCostRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long workOrderId;

    private String workOrderNo;

    private Long categoryId;

    private String categoryName;

    private String costMonth;

    private Integer totalQuantity;

    private Integer qualifiedQuantity;

    private Integer defectiveQuantity;

    private BigDecimal materialCost;

    private BigDecimal materialWasteCost;

    private BigDecimal energyCost;

    private BigDecimal moldCost;

    private BigDecimal laborCost;

    private BigDecimal defectiveCost;

    private BigDecimal otherCost;

    private BigDecimal totalCost;

    private BigDecimal unitCost;

    private Long operatorId;

    private LocalDateTime createTime;

    private String remark;
}