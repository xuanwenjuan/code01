package com.stationery.manufacture.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("stock_flow")
public class StockFlow {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String flowNo;

    private Long materialId;

    private String materialCode;

    private String materialName;

    private String batchNo;

    private String flowType;

    private BigDecimal beforeQuantity;

    private BigDecimal changeQuantity;

    private BigDecimal afterQuantity;

    private String relatedNo;

    private String relatedType;

    private String remark;

    private Long operatorId;

    private String operatorName;

    private LocalDateTime createTime;
}
