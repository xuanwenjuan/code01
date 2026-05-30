package com.incense.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("production_order")
public class ProductionOrder {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderNo;
    private Long categoryId;
    private String categoryName;
    private String formulaDetail;
    private BigDecimal targetQuantity;
    private String unit;
    private String status;
    private Long masterId;
    private String masterName;
    private LocalDateTime startTime;
    private LocalDateTime finishTime;
    private String freezeReason;
    private BigDecimal actualQuantity;
    private BigDecimal lossQuantity;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    @TableLogic
    private Integer deleted;
}
