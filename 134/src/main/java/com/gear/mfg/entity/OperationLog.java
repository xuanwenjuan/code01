package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("operation_log")
public class OperationLog extends BaseEntity {

    private String module;

    private String operation;

    private String method;

    private String params;

    private String result;

    private Long userId;

    private String username;

    private String ip;

    private Integer status;

    private String errorMsg;

    private Long costTime;
}