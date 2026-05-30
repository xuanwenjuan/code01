package com.battery.shell.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("cost_detail")
public class CostDetail {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long costId;

    private Long orderId;

    private String orderNo;

    private BigDecimal materialCost;

    private BigDecimal moldCost;

    private BigDecimal energyCost;

    private BigDecimal laborCost;

    private BigDecimal defectiveCost;

    private BigDecimal totalCost;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
