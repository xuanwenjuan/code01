package com.liquor.brewing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.liquor.brewing.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_stock_record")
public class MaterialStockRecord extends BaseEntity {

    private String recordNo;

    private Long batchId;

    private Long materialId;

    private Integer recordType;

    private BigDecimal quantity;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;

    private Long workOrderId;

    private String remark;
}
