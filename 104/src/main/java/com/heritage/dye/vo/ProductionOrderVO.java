package com.heritage.dye.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductionOrderVO {
    private Long id;
    private String orderNo;
    private Long dyeCategoryId;
    private String dyeCategoryName;
    private Long materialOriginId;
    private String materialOriginName;
    private BigDecimal materialQuantity;
    private BigDecimal expectedOutput;
    private BigDecimal actualOutput;
    private BigDecimal loss;
    private Integer status;
    private String statusText;
    private LocalDateTime planStartTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private Long masterId;
    private String masterName;
    private String remark;
    private Integer step;
    private String stepText;
    private LocalDateTime createTime;
    private List<OrderStepVO> steps;
}
