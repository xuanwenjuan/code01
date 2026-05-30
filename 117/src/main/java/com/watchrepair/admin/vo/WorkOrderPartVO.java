package com.watchrepair.admin.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class WorkOrderPartVO {

    private Long id;

    private Long workOrderId;

    private Long partId;

    private String partCode;

    private String partName;

    private Integer quantity;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;

    private Integer locked;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}