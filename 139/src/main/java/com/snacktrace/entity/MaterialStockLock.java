package com.snacktrace.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("material_stock_lock")
public class MaterialStockLock {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long workOrderId;
    private Long materialId;
    private Long batchId;
    private BigDecimal lockQuantity;
    private Integer lockStatus;
    private Long operatorId;
    private String operatorName;
    private LocalDateTime lockTime;
    private LocalDateTime releaseTime;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    @TableLogic
    private Integer deleted;
}
