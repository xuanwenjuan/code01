package com.leathercraft.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("profit_ledger")
public class ProfitLedger {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String ledgerNo;
    private Long productCategoryId;
    private String productCategoryName;
    private Integer quantity;
    private BigDecimal leatherCost;
    private BigDecimal materialCost;
    private BigDecimal laborCost;
    private BigDecimal totalCost;
    private BigDecimal sellingPrice;
    private BigDecimal profit;
    private BigDecimal profitRate;
    private LocalDate statDate;
    private String remark;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableLogic
    private Integer deleted;
}
