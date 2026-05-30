package com.logistics.bigcargo.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("biz_inventory")
public class Inventory {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String batchNo;

    private String goodsName;

    private Long categoryId;

    private String specification;

    private BigDecimal weight;

    private BigDecimal volume;

    private Integer bearingLevel;

    private String storageZone;

    private String protectionMaterial;

    private Integer quantity;

    private Integer stockStatus;

    private Integer fragileFlag;

    private LocalDateTime protectionExpireTime;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
