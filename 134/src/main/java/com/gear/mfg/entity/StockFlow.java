package com.gear.mfg.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("stock_flow")
public class StockFlow extends BaseEntity {

    private String flowNo;

    private Integer flowType;

    private Long warehouseId;

    private String warehouseName;

    private Long materialId;

    private String materialName;

    private String materialCode;

    private String materialSpec;

    private String batchNo;

    private BigDecimal beforeQuantity;

    private BigDecimal changeQuantity;

    private BigDecimal afterQuantity;

    private String unit;

    private String location;

    private String relatedNo;

    private LocalDateTime operateTime;

    private String operator;

    private String remark;
}
