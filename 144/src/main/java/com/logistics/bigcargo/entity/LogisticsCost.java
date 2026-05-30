package com.logistics.bigcargo.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("biz_logistics_cost")
public class LogisticsCost {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private String orderNo;

    private Long categoryId;

    private BigDecimal storageFee;

    private BigDecimal sortingFee;

    private BigDecimal transportFee;

    private BigDecimal loadingFee;

    private BigDecimal damageFee;

    private BigDecimal totalCost;

    private String costMonth;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
