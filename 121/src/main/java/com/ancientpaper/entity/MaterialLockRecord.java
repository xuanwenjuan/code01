package com.ancientpaper.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("material_lock_record")
public class MaterialLockRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long orderId;
    private Long materialId;
    private BigDecimal lockQuantity;
    private Integer lockStatus;
    private LocalDateTime lockTime;
    private LocalDateTime unlockTime;
    private String remarks;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
