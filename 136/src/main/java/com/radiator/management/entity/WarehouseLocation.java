package com.radiator.management.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("warehouse_location")
public class WarehouseLocation {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long warehouseId;

    private String locationCode;

    private String locationName;

    private String locationType;

    private String area;

    private BigDecimal maxCapacity;

    private Integer status;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}
