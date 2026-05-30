package com.instrument.consignment.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProfitShareVO {

    private Long id;

    private String shareNo;

    private Long archiveId;

    private String traceNo;

    private String instrumentBrand;

    private String instrumentModel;

    private Long workOrderId;

    private String workOrderNo;

    private Long categoryId;

    private String categoryName;

    private String receiveChannel;

    private String receiveChannelDesc;

    private BigDecimal salePrice;

    private BigDecimal materialCost;

    private BigDecimal laborCost;

    private BigDecimal platformCommissionRate;

    private BigDecimal platformCommission;

    private BigDecimal otherCost;

    private BigDecimal totalCost;

    private BigDecimal sellerProfit;

    private String status;

    private String statusDesc;

    private LocalDateTime settleTime;

    private Long operatorId;

    private String operatorName;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
