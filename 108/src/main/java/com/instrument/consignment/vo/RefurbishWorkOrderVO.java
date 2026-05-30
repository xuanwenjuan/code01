package com.instrument.consignment.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class RefurbishWorkOrderVO {

    private Long id;

    private String workOrderNo;

    private Long archiveId;

    private String traceNo;

    private String instrumentBrand;

    private String instrumentModel;

    private String customerName;

    private String customerPhone;

    private String receiveType;

    private String receiveAddress;

    private LocalDateTime receiveTime;

    private Long receiveUserId;

    private String receiveUserName;

    private Long estimatorId;

    private String estimatorName;

    private LocalDateTime estimateTime;

    private String estimateRemark;

    private Long craftsmanId;

    private String craftsmanName;

    private String status;

    private String statusDesc;

    private LocalDateTime statusConfirmTime;

    private BigDecimal actualMaterialCost;

    private BigDecimal actualLaborCost;

    private BigDecimal totalRefurbishCost;

    private LocalDateTime completeTime;

    private String remark;

    private List<WorkOrderStepVO> steps;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
