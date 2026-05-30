package com.aromatherapy.entity.po;

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

    private String operationModule;

    private String operationType;

    private String operationDesc;

    private Long operationUserId;

    private String operationUsername;

    private String requestMethod;

    private String requestUrl;

    private String requestParam;

    private String responseResult;

    private Integer status;

    private String errorMsg;

    private Long costTime;

    private String ipAddress;

    private LocalDateTime createTime;
}
