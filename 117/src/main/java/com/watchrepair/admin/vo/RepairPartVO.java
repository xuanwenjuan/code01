package com.watchrepair.admin.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class RepairPartVO {

    private Long id;

    private String partCode;

    private String partName;

    private String partType;

    private String origin;

    private String compatibleModels;

    private Integer quantity;

    private Integer warningThreshold;

    private BigDecimal unitPrice;

    private String storageLocation;

    private Integer moistureProof;

    private Integer status;

    private String statusDesc;

    private String remarks;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}