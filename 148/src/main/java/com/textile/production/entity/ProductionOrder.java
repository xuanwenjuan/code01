package com.textile.production.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("production_order")
public class ProductionOrder implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;

    private Long categoryId;

    private String fabricName;

    private java.math.BigDecimal planQuantity;

    private java.math.BigDecimal actualQuantity;

    private String unit;

    private Integer priority;

    private String status;

    private String currentProcess;

    private Integer processIndex;

    private LocalDate planStartDate;

    private LocalDate planEndDate;

    private LocalDateTime actualStartDate;

    private LocalDateTime actualEndDate;

    private Integer timeout;

    private Long operatorId;

    private String remark;

    @TableLogic
    private Integer deleted;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
