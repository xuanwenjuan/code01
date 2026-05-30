package com.heritage.dye.po;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_step")
public class OrderStepPO extends BasePO {
    private Long orderId;
    private String orderNo;
    private Integer stepNo;
    private String stepName;
    private String description;
    private String operator;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer status;
    private BigDecimal stepLoss;
    private String remark;
}
