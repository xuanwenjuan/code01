package com.heritage.dye.po;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_order")
public class ProductionOrderPO extends BasePO {
    private String orderNo;
    private Long dyeCategoryId;
    private String dyeCategoryName;
    private Long materialOriginId;
    private String materialOriginName;
    private BigDecimal materialQuantity;
    private BigDecimal expectedOutputRate;
    private BigDecimal actualOutput;
    private BigDecimal totalLoss;
    private BigDecimal soakLoss;
    private BigDecimal boilLoss;
    private BigDecimal filterLoss;
    private BigDecimal concentrateLoss;
    private BigDecimal packageLoss;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private Integer status;
    private LocalDateTime planStartTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private Long masterId;
    private String masterName;
    private Long warehouseManagerId;
    private String warehouseManagerName;
    private String remark;
    private Integer currentStep;
}
