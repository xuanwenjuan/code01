package com.aluminum.extrusion.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class WorkOrderDetailVO {
    private Long id;
    private String orderNo;
    private Long categoryId;
    private String categoryName;
    private Long stockId;
    private String batchNo;
    private String alloyGrade;
    private BigDecimal planQuantity;
    private BigDecimal actualQuantity;
    private BigDecimal scrapQuantity;
    private BigDecimal heatingLoss;
    private BigDecimal extrusionLoss;
    private BigDecimal cuttingLoss;
    private BigDecimal surfaceLoss;
    private BigDecimal totalLoss;
    private BigDecimal yieldRate;
    private Integer status;
    private String statusName;
    private String extrusionProcess;
    private String moldCode;
    private BigDecimal heatingTemp;
    private BigDecimal extrusionSpeed;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String operator;
    private String remark;
    private LocalDateTime createTime;
}
