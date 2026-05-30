package com.logistics.bigcargo.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("biz_dispatch_order")
public class DispatchOrder {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;

    private Long inventoryId;

    private Long categoryId;

    private String customerName;

    private String customerPhone;

    private String pickupAddress;

    private String deliveryAddress;

    private BigDecimal distance;

    private Long vehicleId;

    private Long driverId;

    private Long sorterId;

    private Integer orderStatus;

    private Integer priority;

    private LocalDateTime expectArriveTime;

    private LocalDateTime actualArriveTime;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
