package com.radiator.management.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("material_lock")
public class MaterialLock {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long workOrderId;

    private String workOrderNo;

    private Long materialId;

    private String materialCode;

    private String materialName;

    private String batchNo;

    private BigDecimal lockQuantity;

    private String lockType;

    private String status;

    private Long lockUserId;

    private String lockUserName;

    private LocalDateTime lockTime;

    private Long unlockUserId;

    private String unlockUserName;

    private LocalDateTime unlockTime;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}
