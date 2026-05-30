package com.cosmetics.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("work_process")
public class WorkProcess {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long workOrderId;

    private Integer processType;

    private Long operatorId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer status;

    private String equipment;

    private String parameters;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
