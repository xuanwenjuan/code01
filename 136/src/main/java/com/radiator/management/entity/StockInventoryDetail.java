package com.radiator.management.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("stock_inventory_detail")
public class StockInventoryDetail {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long inventoryId;

    private Long materialId;

    private String materialCode;

    private String materialName;

    private String specification;

    private String unit;

    private String batchNo;

    private BigDecimal systemQuantity;

    private BigDecimal actualQuantity;

    private BigDecimal differenceQuantity;

    private String differenceReason;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}
