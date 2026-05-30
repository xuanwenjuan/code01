package com.construction.material.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("operation_log")
public class OperationLogEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String module;

    private String operation;

    private String description;

    private String method;

    private String requestUri;

    private String requestMethod;

    private String ip;

    private String params;

    private Long costTime;

    private Integer status;

    private String errorMsg;

    private Long operateBy;

    private LocalDateTime operateTime;
}
