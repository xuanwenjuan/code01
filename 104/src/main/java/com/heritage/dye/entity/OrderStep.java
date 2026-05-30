package com.heritage.dye.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_step")
public class OrderStep extends BaseEntity {
    private Long orderId;
    private String orderNo;
    private Integer stepNo;
    private String stepName;
    private String description;
    private String operator;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer status;
    private String remark;
}
