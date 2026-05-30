package com.snacktrace.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("material_stock_flow")
public class MaterialStockFlow {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long materialId;
    private Long batchId;
    private Long workOrderId;
    private Integer flowType;
    private BigDecimal quantity;
    private BigDecimal beforeQuantity;
    private BigDecimal afterQuantity;
    private Long operatorId;
    private String operatorName;
    private String remark;
    private LocalDateTime createTime;
}
