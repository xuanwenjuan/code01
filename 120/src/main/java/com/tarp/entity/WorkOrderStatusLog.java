package com.tarp.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("work_order_status_log")
public class WorkOrderStatusLog {
    private Long id;
    private Long workOrderId;
    private String orderNo;
    private Integer oldStatus;
    private Integer newStatus;
    private Long operatorId;
    private String operatorName;
    private String remark;
    private LocalDateTime createTime;
}
