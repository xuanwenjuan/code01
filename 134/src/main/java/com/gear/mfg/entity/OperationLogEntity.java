package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("sys_operation_log")
public class OperationLogEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String module;

    private String operation;

    private String description;

    private String method;

    private String params;

    private String result;

    private Long userId;

    private String username;

    private String ip;

    private String url;

    private String httpMethod;

    private Integer status;

    private String errorMessage;

    private Long costTime;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime createTime;
}
