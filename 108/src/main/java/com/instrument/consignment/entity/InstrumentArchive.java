package com.instrument.consignment.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("instrument_archive")
public class InstrumentArchive extends BaseEntity {

    private String traceNo;

    private Long categoryId;

    private String brand;

    private Integer productionYear;

    private String model;

    private String conditionLevel;

    private Integer accessoriesComplete;

    private String accessoriesDesc;

    private String appearanceDesc;

    private String status;

    private Long sellerId;

    private BigDecimal estimatedPrice;

    private BigDecimal salePrice;

    private LocalDateTime lastMaintainTime;

    private LocalDateTime nextMaintainTime;

    private Integer maintainCycleDays;

    private String remark;
}
