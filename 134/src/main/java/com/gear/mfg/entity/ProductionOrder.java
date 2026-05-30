package com.gear.mfg.entity;

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

    private Long categoryId;

    private String gearModel;

    private BigDecimal quantity;

    private Integer currentProcess;

    private Integer orderStatus;

    private LocalDateTime planStartDate;

    private LocalDateTime planEndDate;

    private LocalDateTime actualStartDate;

    private LocalDateTime actualEndDate;

    private String productionLine;

    private String teamLeader;

    private String remark;
}