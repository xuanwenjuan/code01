package com.snacktrace.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("work_order_process")
public class WorkOrderProcess {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long workOrderId;
    private Integer processStage;
    private String processName;
    private Long operatorId;
    private String operatorName;
    private Long teamLeaderId;
    private String teamLeaderName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer processStatus;
    private String remark;
    private String processParams;
    private LocalDateTime createTime;
}
