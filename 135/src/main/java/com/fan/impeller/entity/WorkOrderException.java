package com.fan.impeller.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_exception")
public class WorkOrderException extends BaseEntity {
    private Long workOrderId;
    private String workOrderNo;
    private Integer step;
    private String stepName;
    private String exceptionType;
    private String description;
    private Long reporterId;
    private String reporterName;
    private Long handlerId;
    private String handlerName;
    private LocalDateTime handleTime;
    private String handleResult;
    private Integer status;
    private String remark;
}
