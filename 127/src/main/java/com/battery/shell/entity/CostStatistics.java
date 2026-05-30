package com.battery.shell.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("cost_statistics")
public class CostStatistics {
    @TableId(type = IdType.AUTO)
    private Long id;

    private LocalDate statisticsDate;

    private Long categoryId;

    private BigDecimal materialCost;

    private BigDecimal moldCost;

    private BigDecimal energyCost;

    private BigDecimal laborCost;

    private BigDecimal defectiveCost;

    private BigDecimal totalCost;

    private Integer productionQuantity;

    private BigDecimal unitCost;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
