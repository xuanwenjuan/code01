package com.hardware.stamping.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("operation_log")
public class OperationLog extends BaseEntity {

    private Long userId;

    private String username;

    private String operation;

    private String method;

    private String params;

    private String ip;

    private Long duration;

    private String result;
}
