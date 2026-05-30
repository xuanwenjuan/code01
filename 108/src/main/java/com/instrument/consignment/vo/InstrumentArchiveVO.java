package com.instrument.consignment.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class InstrumentArchiveVO {

    private Long id;

    private String traceNo;

    private Long categoryId;

    private String categoryName;

    private String brand;

    private Integer productionYear;

    private String model;

    private String conditionLevel;

    private String conditionLevelDesc;

    private Integer accessoriesComplete;

    private String accessoriesDesc;

    private String appearanceDesc;

    private String status;

    private String statusDesc;

    private Long sellerId;

    private String sellerName;

    private BigDecimal estimatedPrice;

    private BigDecimal salePrice;

    private LocalDateTime lastMaintainTime;

    private LocalDateTime nextMaintainTime;

    private Integer maintainCycleDays;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
