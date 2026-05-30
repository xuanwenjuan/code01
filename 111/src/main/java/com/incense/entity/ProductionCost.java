package com.incense.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("production_cost")
public class ProductionCost {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long orderId;
    private String orderNo;
    private Long categoryId;
    private String categoryName;
    private BigDecimal targetQuantity;
    private BigDecimal actualQuantity;
    private BigDecimal materialCost;
    private BigDecimal processCost;
    private BigDecimal lossCost;
    private BigDecimal totalCost;
    private BigDecimal unitCost;
    private String costDetail;
    private Long operatorId;
    private String operatorName;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
