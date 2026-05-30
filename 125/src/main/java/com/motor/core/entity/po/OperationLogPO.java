package com.motor.core.entity.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("operation_log")
public class OperationLogPO {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String module;

    private String operation;

    private String description;

    private Long operatorId;

    private String operatorName;

    private String ip;

    private String requestUrl;

    private String requestMethod;

    private String requestParams;

    private String responseResult;

    private String errorMessage;

    private Integer success;

    private Integer costTime;

    private LocalDateTime createTime;
}
