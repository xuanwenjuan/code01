package com.household.management.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("sys_operation_log")
@Schema(description = "操作日志实体")
public class SysOperationLog implements Serializable {

    @Schema(description = "主键ID")
    private Long id;

    @Schema(description = "模块")
    private String module;

    @Schema(description = "操作")
    private String operation;

    @Schema(description = "方法")
    private String method;

    @Schema(description = "请求参数")
    private String params;

    @Schema(description = "返回结果")
    private String result;

    @Schema(description = "操作人")
    private String operator;

    @Schema(description = "IP地址")
    private String ip;

    @Schema(description = "耗时(ms)")
    private Long costTime;

    @Schema(description = "状态：1-成功 0-失败")
    private Integer status;

    @Schema(description = "错误信息")
    private String errorMsg;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;
}
