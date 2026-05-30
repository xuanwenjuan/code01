package com.gearbox.manage.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_process")
public class WorkProcess extends BaseEntity {
    private Long workOrderId;
    private String processCode;
    private String processName;
    private Integer processOrder;
    private Long operatorId;
    private String operatorName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal workHours;
    private String machineCode;
    private BigDecimal machineHours;
    private BigDecimal toolUsage;
    private String status;
    private String remark;
}
