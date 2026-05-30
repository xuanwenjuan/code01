package com.liquor.brewing.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("operation_log")
public class OperationLog implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String module;

    private String operationType;

    private String operationDesc;

    private String method;

    private String requestParams;

    private String responseResult;

    private Long userId;

    private String username;

    private String ipAddress;

    private LocalDateTime operationTime;

    private Long costTime;

    private Integer status;

    private String errorMsg;
}
