package com.radiator.management.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("stock_inventory")
public class StockInventory {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String inventoryNo;

    private Long warehouseId;

    private String warehouseName;

    private Long locationId;

    private String locationName;

    private String inventoryType;

    private String status;

    private Integer totalItems;

    private Integer discrepancyItems;

    private String remark;

    private Long approverId;

    private LocalDateTime approveTime;

    @TableField(exist = false)
    private List<StockInventoryDetail> details;

    @TableField(fill = FieldFill.INSERT)
    private Long createBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}
