package com.leathercraft.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("operation_log")
public class OperationLog {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String username;
    private String operationModule;
    private String operationType;
    private String operationDesc;
    private String requestUrl;
    private String requestMethod;
    private String requestParams;
    private String ipAddress;
    private LocalDateTime operationTime;
    private Long costTime;
}
