package com.radiator.management.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("finished_stock")
public class FinishedStock {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long workOrderId;

    private String workOrderNo;

    private Long categoryId;

    private String categoryName;

    private String productCode;

    private String productName;

    private String specification;

    private Integer quantity;

    private Long warehouseId;

    private String warehouseName;

    private Long locationId;

    private String locationName;

    private String batchNo;

    private BigDecimal unitCost;

    private BigDecimal totalCost;

    private String qualityLevel;

    private String remark;

    private Long inspectorId;

    private LocalDateTime storageTime;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}
