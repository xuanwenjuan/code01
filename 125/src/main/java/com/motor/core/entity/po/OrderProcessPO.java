package com.motor.core.entity.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("order_process")
public class OrderProcessPO {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private String processCode;

    private String processName;

    private Long operatorId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer processDuration;

    private Integer outputQuantity;

    private Integer defectiveQuantity;

    private BigDecimal materialWaste;

    private BigDecimal energyConsumption;

    private BigDecimal laborHours;

    private Integer status;

    private String remark;

    private LocalDateTime createTime;
}
