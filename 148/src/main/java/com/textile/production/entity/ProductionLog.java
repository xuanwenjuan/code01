package com.textile.production.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("production_log")
public class ProductionLog implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private Long processId;

    private String operationType;

    private String operationContent;

    private Long operatorId;

    private String operatorName;

    private String beforeStatus;

    private String afterStatus;

    @TableLogic
    private Integer deleted;

    private LocalDateTime createTime;
}
