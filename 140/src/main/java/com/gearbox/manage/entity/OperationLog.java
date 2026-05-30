package com.gearbox.manage.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
@TableName("operation_log")
public class OperationLog {
    private Long id;
    private Long userId;
    private String username;
    private String operation;
    private String module;
    private String method;
    private String params;
    private String result;
    private String ip;
    private Long duration;
    private Integer status;
    private String errorMsg;
    private java.time.LocalDateTime createTime;
}
