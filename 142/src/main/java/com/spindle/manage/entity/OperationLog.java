package com.spindle.manage.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("operation_log")
public class OperationLog extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String username;

    private String operation;

    private String operationType;

    private String businessType;

    private Long businessId;

    private String businessNo;

    private String method;

    private String params;

    private String result;

    private String ip;

    private LocalDateTime operationTime;

    private Long costTime;

    private Integer status;

    private String errorMsg;

}
