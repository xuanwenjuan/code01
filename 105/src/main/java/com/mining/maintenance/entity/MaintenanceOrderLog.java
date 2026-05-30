package com.mining.maintenance.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("maintenance_order_log")
public class MaintenanceOrderLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private String orderNo;

    private String operationType;

    private String operationContent;

    private Long operatorId;

    private String operatorName;

    private LocalDateTime operationTime;

    private String fromStatus;

    private String toStatus;

    private LocalDateTime createTime;
}