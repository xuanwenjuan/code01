package com.woodendoor.production.entity;

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
    private Integer processType;
    private String processName;
    private Integer sort;
    private Integer status;
    private Long operatorId;
    private String operatorName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String remark;
}