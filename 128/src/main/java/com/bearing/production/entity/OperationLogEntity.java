package com.bearing.production.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_operation_log")
public class OperationLogEntity extends BaseEntity {
    private String module;
    private String description;
    private String method;
    private String params;
    private String ip;
    private Long userId;
    private String username;
    private Long duration;
}
