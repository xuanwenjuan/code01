package com.heritage.dye.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class SupplyLedgerVO {
    private Long id;
    private String ledgerNo;
    private Long dyeCategoryId;
    private String dyeCategoryName;
    private Long materialOriginId;
    private String materialOriginName;
    private LocalDate statisticsDate;
    private BigDecimal materialConsumption;
    private BigDecimal productOutput;
    private BigDecimal loss;
    private BigDecimal salesRevenue;
    private String remark;
    private LocalDateTime createTime;
}
