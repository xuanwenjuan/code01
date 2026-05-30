package com.heritage.dye.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_order")
public class ProductionOrder extends BaseEntity {
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
    private LocalDateTime planStartTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private Long masterId;
    private String masterName;
    private String remark;
    private Integer step;
}
