package com.bee.equipment.po;

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

    private Long userId;

    private String username;

    private String module;

    private String description;

    private String ip;

    private String requestUrl;

    private String requestMethod;

    private String requestParams;

    private String responseResult;

    private Long costTime;

    private Integer status;

    private String errorMsg;

    private LocalDateTime createTime;
}
