package com.fastener.production.entity.material;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fastener.production.common.entity.BaseEntity;
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

    private String materialName;

    private Long batchId;

    private String batchCode;

    private BigDecimal quantity;

    private BigDecimal unitPrice;

    private BigDecimal totalAmount;

    private Long workOrderId;

    private String operator;

    private LocalDateTime operateTime;

    private String remark;
}
