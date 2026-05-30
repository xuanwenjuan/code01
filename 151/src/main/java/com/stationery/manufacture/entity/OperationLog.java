package com.stationery.manufacture.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("operation_log")
public class OperationLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String module;

    private String operation;

    private String method;

    private String requestParams;

    private String responseResult;

    private Long operatorId;

    private String operatorName;

    private String operatorRole;

    private String ip;

    private LocalDateTime operateTime;

    private Long costTime;

    private Integer status;

    private String errorMsg;
}
