package com.bee.equipment.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("operation_log")
public class OperationLog {

    private Long id;

    private Long userId;

    private String username;

    private String module;

    private String description;

    private String ip;

    private LocalDateTime createTime;
}
