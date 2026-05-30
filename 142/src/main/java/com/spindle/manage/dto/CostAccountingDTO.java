package com.spindle.manage.dto;

import com.spindle.manage.entity.OrderMaterialDetail;
import com.spindle.manage.entity.ProductionLossRecord;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class CostAccountingDTO {

    private Long orderId;

    private String orderNo;

    private BigDecimal totalMaterialCost;

    private List<OrderMaterialDetail> materialDetails;

    private BigDecimal totalLossCost;

    private List<ProductionLossRecord> lossRecords;

    private Map<String, BigDecimal> lossTypeSummary;

    private BigDecimal processingCost;

    private BigDecimal totalCost;

}
