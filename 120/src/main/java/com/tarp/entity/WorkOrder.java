package com.tarp.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order")
public class WorkOrder extends BaseEntity {
    private String orderNo;
    private Long categoryId;
    private Integer quantity;
    private Integer status;
    private Long cutterId;
    private Long oilerId;
    private Long sewerId;
    private Long assemblerId;
    private Long inspectorId;
    private BigDecimal materialCost;
    private BigDecimal laborCost;
    private BigDecimal totalCost;
    private BigDecimal lossCost;
    private BigDecimal comprehensiveCost;
    private LocalDateTime expectTime;
    private LocalDateTime startTime;
    private LocalDateTime finishTime;
    private String remark;
}
