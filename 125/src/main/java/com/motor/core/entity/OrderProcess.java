package com.motor.core.entity;

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
    private Long operatorId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer processDuration;
    private Integer outputQuantity;
    private Integer defectiveQuantity;
    private Integer status;
    private String remark;
    private LocalDateTime createTime;
}
