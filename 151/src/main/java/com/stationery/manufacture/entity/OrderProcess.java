package com.stationery.manufacture.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("order_process")
public class OrderProcess {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private String processCode;

    private String processName;

    private Integer processSort;

    private Integer processStatus;

    private Long operatorId;

    private String operatorName;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private BigDecimal workingHours;

    private String processRemark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
