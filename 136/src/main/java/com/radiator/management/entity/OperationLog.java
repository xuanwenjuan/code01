package com.radiator.management.entity;

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

    private String operation;

    private String module;

    private String ip;

    private String params;

    private String result;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}