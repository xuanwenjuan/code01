package com.battery.shell.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("material")
public class Material {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String materialCode;

    private String materialName;

    private String materialType;

    private String spec;

    private String unit;

    private BigDecimal stockQuantity;

    private BigDecimal warningQuantity;

    private String status;

    private String batchNo;

    private Integer isOxidizable;

    private Integer storageDays;

    private LocalDateTime inboundTime;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
