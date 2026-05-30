package com.fastener.production.entity.material;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fastener.production.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("material_batch")
public class MaterialBatch extends BaseEntity {

    private String batchCode;

    private Long materialId;

    private String materialName;

    private BigDecimal quantity;

    private BigDecimal availableQuantity;

    private BigDecimal reservedQuantity;

    private Integer reservedOrderCount;

    private BigDecimal unitPrice;

    private BigDecimal totalAmount;

    private LocalDateTime inboundTime;

    private LocalDate productionDate;

    private LocalDate expirationDate;

    private String warehouseCode;

    private String locationCode;

    private String inspector;

    private String inspectionResult;

    private Integer status;

    private String remark;
}
