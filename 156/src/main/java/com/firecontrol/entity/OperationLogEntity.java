package com.firecontrol.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_operation_log")
public class OperationLogEntity extends BaseEntity {

    private String module;

    private String operation;

    private String description;

    private String method;

    private String params;

    private String result;

    private Long userId;

    private String username;

    private String ipAddress;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Long costTime;

    private Integer status;

    private String errorMsg;
}
