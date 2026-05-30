package com.zongshi.brush.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("production_order")
public class ProductionOrder extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;

    private Long categoryId;

    private String brushName;

    private String brushSpec;

    private String craftType;

    private Integer planQuantity;

    private Integer actualQuantity;

    private Integer defectiveQuantity;

    private Integer priority;

    private Integer orderStatus;

    private Integer isCraftConfirmed;

    private LocalDateTime craftConfirmTime;

    private Long workerId;

    private String workerName;

    private LocalDateTime startTime;

    private LocalDateTime expectFinishTime;

    private LocalDateTime actualFinishTime;

    private BigDecimal materialCost;

    private BigDecimal laborCost;

    private BigDecimal processLossCost;

    private BigDecimal defectiveCost;

    private BigDecimal totalCost;

    private BigDecimal unitCost;

    private String remark;

    private Integer isTimeout;
}
