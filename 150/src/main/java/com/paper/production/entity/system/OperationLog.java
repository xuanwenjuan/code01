package com.paper.production.entity.system;

import com.baomidou.mybatisplus.annotation.TableName;
import com.paper.production.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_operation_log")
public class OperationLog extends BaseEntity {

    private String module;
    private String operation;
    private String description;
    private String method;
    private String params;
    private String ip;
    private String location;
    private Long userId;
    private String username;
    private Integer status;
    private String errorMsg;
    private Long costTime;
}
