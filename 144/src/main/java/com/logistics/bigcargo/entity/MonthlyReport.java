package com.logistics.bigcargo.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("biz_monthly_report")
public class MonthlyReport {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String reportMonth;

    private Long categoryId;

    private String categoryName;

    private Integer totalOrders;

    private Integer completedOrders;

    private BigDecimal totalStorageFee;

    private BigDecimal totalSortingFee;

    private BigDecimal totalTransportFee;

    private BigDecimal totalLoadingFee;

    private BigDecimal totalDamageFee;

    private BigDecimal totalCost;

    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
