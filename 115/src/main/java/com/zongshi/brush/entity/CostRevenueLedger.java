package com.zongshi.brush.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cost_revenue_ledger")
public class CostRevenueLedger extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String ledgerNo;

    private LocalDate ledgerDate;

    private Long categoryId;

    private String brushName;

    private Integer productionQuantity;

    private BigDecimal materialCost;

    private BigDecimal laborCost;

    private BigDecimal processLossCost;

    private BigDecimal totalCost;

    private BigDecimal salesRevenue;

    private BigDecimal profit;

    private String remark;
}
