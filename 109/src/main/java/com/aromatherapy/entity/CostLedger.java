package com.aromatherapy.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("cost_ledger")
public class CostLedger extends BaseEntity {

    private String ledgerNo;

    private Long workOrderId;

    private Long categoryId;

    private String categoryName;

    private String materialOrigin;

    private BigDecimal totalMaterialCost;

    private BigDecimal totalMaterialConsumption;

    private BigDecimal mixingLoss;

    private BigDecimal mixingLossCost;

    private BigDecimal laborCost;

    private BigDecimal totalCost;

    private BigDecimal supplyQuantity;

    private BigDecimal supplyPrice;

    private BigDecimal profit;

    private BigDecimal profitMargin;

    private Integer settlementStatus;

    private LocalDateTime settlementTime;

    private String remark;
}
