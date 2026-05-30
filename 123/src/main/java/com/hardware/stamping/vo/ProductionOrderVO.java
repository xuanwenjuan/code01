package com.hardware.stamping.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductionOrderVO {
    private Long id;
    private String orderNo;
    private Long categoryId;
    private String categoryName;
    private BigDecimal quantity;
    private Long materialId;
    private String materialBatchCode;
    private String moldNo;
    private String machineNo;
    private Integer status;
    private String statusText;
    private LocalDateTime planStartTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private BigDecimal productionHours;
    private BigDecimal qualifiedQuantity;
    private BigDecimal scrapQuantity;
    private String operator;
    private String technician;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
