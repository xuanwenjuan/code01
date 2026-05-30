package com.instrument.consignment.po;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("material_lock")
public class MaterialLockPO {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long workOrderId;

    private Long materialId;

    private String materialCode;

    private String materialName;

    private Integer lockQuantity;

    private BigDecimal lockPrice;

    private BigDecimal lockAmount;

    private Integer status;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer isDeleted;
}
