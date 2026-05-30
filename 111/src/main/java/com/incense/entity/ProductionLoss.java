package com.incense.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("production_loss")
public class ProductionLoss {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long orderId;
    private String orderNo;
    private Long materialId;
    private String materialName;
    private String batchCode;
    private String lossType;
    private BigDecimal lossQuantity;
    private BigDecimal unitPrice;
    private BigDecimal lossAmount;
    private String lossReason;
    private Long operatorId;
    private String operatorName;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
