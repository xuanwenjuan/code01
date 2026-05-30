package com.zongshi.brush.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("material_lock_log")
public class MaterialLockLog {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private Long materialId;

    private String materialName;

    private BigDecimal lockQuantity;

    private BigDecimal unlockQuantity;

    private Integer lockType;

    private Integer lockStatus;

    private Long operatorId;

    private String operatorName;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
