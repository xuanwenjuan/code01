package com.flange.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("cost_accounting")
public class CostAccounting {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private String orderNo;

    private Long materialId;

    private String materialName;

    private BigDecimal materialQuantity;

    private BigDecimal materialCost;

    private BigDecimal toolCost;

    private BigDecimal energyCost;

    private BigDecimal laborCost;

    private BigDecimal scrapCost;

    private BigDecimal totalCost;

    private BigDecimal laborHours;

    private BigDecimal machineHours;

    private Integer scrapQuantity;

    private String status;

    private Long confirmBy;

    private LocalDateTime confirmTime;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
