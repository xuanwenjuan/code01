package com.camping.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("operation_log")
public class OperationLog extends BaseEntity {

    private Long userId;

    private String username;

    private String module;

    private String operation;

    private String method;

    private String params;

    private String result;

    private String ip;

    private Long duration;

    private String remark;
}
