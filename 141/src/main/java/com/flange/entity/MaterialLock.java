package com.flange.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("material_lock")
public class MaterialLock {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long materialId;

    private String materialName;

    private String batchNo;

    private Long orderId;

    private String orderNo;

    private BigDecimal lockQuantity;

    private String lockType;

    private String status;

    private Long operatorId;

    private String operatorName;

    private LocalDateTime expireTime;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
