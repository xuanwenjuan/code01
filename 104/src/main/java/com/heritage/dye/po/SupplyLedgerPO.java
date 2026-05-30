package com.heritage.dye.po;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("supply_ledger")
public class SupplyLedgerPO extends BasePO {
    private String ledgerNo;
    private Long dyeCategoryId;
    private String dyeCategoryName;
    private Long materialOriginId;
    private String materialOriginName;
    private LocalDate statisticsDate;
    private BigDecimal materialConsumption;
    private BigDecimal productOutput;
    private BigDecimal totalLoss;
    private BigDecimal soakLoss;
    private BigDecimal boilLoss;
    private BigDecimal filterLoss;
    private BigDecimal concentrateLoss;
    private BigDecimal packageLoss;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private BigDecimal salesRevenue;
    private String remark;
}
