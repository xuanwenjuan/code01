package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_process")
public class OrderProcess extends BaseEntity {

    private Long orderId;

    private String orderNo;

    private Integer processNo;

    private String processName;

    private Integer processStatus;

    private String operator;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String equipment;

    private String checkResult;

    private String remark;
}