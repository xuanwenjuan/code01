package com.fan.impeller.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_stock_log")
public class MaterialStockLog extends BaseEntity {
    private Long materialId;
    private String materialName;
    private String batchNo;
    private Integer type;
    private BigDecimal beforeQuantity;
    private BigDecimal changeQuantity;
    private BigDecimal afterQuantity;
    private Long operatorId;
    private String operatorName;
    private Long workOrderId;
    private String workOrderNo;
    private Long purchaseOrderId;
    private String purchaseOrderNo;
    private String remark;
}
