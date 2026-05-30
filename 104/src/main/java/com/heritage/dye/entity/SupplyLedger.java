package com.heritage.dye.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("supply_ledger")
public class SupplyLedger extends BaseEntity {
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
}
