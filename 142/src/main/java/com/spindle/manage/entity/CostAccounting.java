package com.spindle.manage.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cost_accounting")
public class CostAccounting extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private String orderNo;

    private BigDecimal materialCost;

    private BigDecimal toolCost;

    private BigDecimal machineCost;

    private BigDecimal laborCost;

    private BigDecimal scrapCost;

    private BigDecimal otherCost;

    private BigDecimal totalCost;

    private BigDecimal unitCost;

    private Integer accountingStatus;

    private LocalDate accountingDate;

    private Long accountantId;

    private String accountantName;

    private LocalDateTime reconciliationTime;

    private Long reconciliatorId;

    private String reconciliatorName;

    private String remark;

}
