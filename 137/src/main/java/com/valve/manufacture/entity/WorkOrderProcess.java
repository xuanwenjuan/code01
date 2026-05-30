package com.valve.manufacture.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.valve.manufacture.common.BaseEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("work_order_process")
public class WorkOrderProcess extends BaseEntity {

    @NotNull(message = "工单ID不能为空")
    private Long workOrderId;

    @NotBlank(message = "工序名称不能为空")
    private String processName;

    @NotBlank(message = "工序编码不能为空")
    private String processCode;

    @NotNull(message = "工序顺序不能为空")
    private Integer processOrder;

    private String status;

    private Long operatorId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private BigDecimal workHours;

    private String remark;
}
