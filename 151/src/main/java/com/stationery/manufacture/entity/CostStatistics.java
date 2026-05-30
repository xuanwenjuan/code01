package com.stationery.manufacture.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("cost_statistics")
public class CostStatistics {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private String orderNo;

    private String productName;

    private Integer quantity;

    private BigDecimal materialCost;

    private BigDecimal equipmentCost;

    private BigDecimal laborCost;

    private BigDecimal reworkCost;

    private BigDecimal defectiveCost;

    private BigDecimal totalCost;

    private BigDecimal unitCost;

    private String period;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
