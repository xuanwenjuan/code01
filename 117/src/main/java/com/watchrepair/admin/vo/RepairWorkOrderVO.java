package com.watchrepair.admin.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class RepairWorkOrderVO {

    private Long id;

    private String orderNo;

    private Long categoryId;

    private String categoryName;

    private String watchModel;

    private String customerName;

    private String customerPhone;

    private String faultDescription;

    private Integer status;

    private String statusDesc;

    private Long technicianId;

    private String technicianName;

    private Long partsSelectorId;

    private String partsSelectorName;

    private LocalDateTime receivedTime;

    private LocalDateTime disassembleTime;

    private LocalDateTime partsReplaceTime;

    private LocalDateTime adjustTime;

    private LocalDateTime polishTime;

    private LocalDateTime completedTime;

    private BigDecimal partsCost;

    private BigDecimal laborCost;

    private BigDecimal appearanceCost;

    private BigDecimal lossCost;

    private BigDecimal totalAmount;

    private String inspectionReport;

    private String remarks;

    private List<WorkOrderPartVO> workOrderParts;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}