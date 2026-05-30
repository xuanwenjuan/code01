package com.incense.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("material_stock_lock")
public class MaterialStockLock {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long orderId;
    private String orderNo;
    private Long materialId;
    private String materialName;
    private String batchCode;
    private BigDecimal lockQuantity;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;
    private String lockStatus;
    private LocalDateTime lockTime;
    private LocalDateTime releaseTime;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
