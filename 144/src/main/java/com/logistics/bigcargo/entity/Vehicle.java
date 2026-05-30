package com.logistics.bigcargo.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("biz_vehicle")
public class Vehicle {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String plateNo;

    private String vehicleType;

    private BigDecimal loadCapacity;

    private BigDecimal volumeCapacity;

    private Integer status;

    private String driverName;

    private String driverPhone;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
