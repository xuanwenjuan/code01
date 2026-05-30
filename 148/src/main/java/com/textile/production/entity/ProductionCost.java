package com.textile.production.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("production_cost")
public class ProductionCost implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private java.math.BigDecimal materialCost;

    private java.math.BigDecimal equipmentCost;

    private java.math.BigDecimal laborCost;

    private java.math.BigDecimal dyeCost;

    private java.math.BigDecimal processLossCost;

    private java.math.BigDecimal shrinkageLossCost;

    private java.math.BigDecimal energyCost;

    private java.math.BigDecimal managementCost;

    private java.math.BigDecimal defectiveCost;

    private java.math.BigDecimal otherCost;

    private java.math.BigDecimal totalCost;

    private java.math.BigDecimal unitCost;

    private Integer settlementStatus;

    private LocalDateTime settlementTime;

    private String remark;

    @TableLogic
    private Integer deleted;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
