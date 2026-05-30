package com.cosmetics.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("formula")
public class Formula {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String formulaCode;

    private String name;

    private Long productId;

    private String version;

    private BigDecimal outputQuantity;

    private String outputUnit;

    private Integer status;

    private String description;

    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
