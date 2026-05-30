package com.textile.production.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("production_process")
public class ProductionProcess implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private String processName;

    private Integer processIndex;

    private String status;

    private Long operatorId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private java.math.BigDecimal outputQuantity;

    private java.math.BigDecimal defectiveQuantity;

    private String equipment;

    private String remark;

    @TableLogic
    private Integer deleted;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
