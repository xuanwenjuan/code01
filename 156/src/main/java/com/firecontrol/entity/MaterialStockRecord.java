package com.firecontrol.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_stock_record")
public class MaterialStockRecord extends BaseEntity {

    private String recordNo;

    private Integer recordType;

    private Long materialId;

    private String materialCode;

    private String materialName;

    private Long batchId;

    private String batchCode;

    private BigDecimal quantity;

    private BigDecimal beforeQuantity;

    private BigDecimal afterQuantity;

    private Long workOrderId;

    private String orderNo;

    private String operatorName;

    private LocalDateTime operateTime;

    private String remark;
}
