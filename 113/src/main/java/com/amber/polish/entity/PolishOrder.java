package com.amber.polish.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("polish_order")
public class PolishOrder extends BaseEntity {

    private String orderNo;

    private Long rawStoneId;

    private String customerName;

    private String customerPhone;

    private String designRequirements;

    private LocalDateTime designConfirmTime;

    private Long polisherId;

    private LocalDateTime startTime;

    private LocalDateTime finishTime;

    private BigDecimal materialCost;

    private BigDecimal laborCost;

    private BigDecimal orderAmount;

    private String status;

    private String remark;
}
