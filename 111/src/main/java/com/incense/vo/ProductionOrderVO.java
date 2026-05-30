package com.incense.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductionOrderVO {
    private Long id;
    private String orderNo;
    private Long categoryId;
    private String categoryName;
    private String formulaDetail;
    private BigDecimal targetQuantity;
    private String unit;
    private String status;
    private Long masterId;
    private String masterName;
    private LocalDateTime startTime;
    private LocalDateTime finishTime;
    private String freezeReason;
    private BigDecimal actualQuantity;
    private BigDecimal lossQuantity;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    private List<OrderMaterialUsageVO> materialUsages;
    private List<OrderProcessLogVO> processLogs;
    private ProductionCostVO costDetail;
}
