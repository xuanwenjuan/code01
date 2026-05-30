package com.instrument.consignment.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("profit_share")
public class ProfitShare extends BaseEntity {

    private String shareNo;

    private Long archiveId;

    private String traceNo;

    private Long workOrderId;

    private Long categoryId;

    private String receiveChannel;

    private BigDecimal salePrice;

    private BigDecimal materialCost;

    private BigDecimal laborCost;

    private BigDecimal platformCommissionRate;

    private BigDecimal platformCommission;

    private BigDecimal otherCost;

    private BigDecimal totalCost;

    private BigDecimal sellerProfit;

    private String status;

    private LocalDateTime settleTime;

    private Long operatorId;

    private String remark;
}
