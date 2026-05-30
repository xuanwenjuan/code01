package com.bee.equipment.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class WorkOrderMaterialVO {

    private Long id;

    private Long workOrderId;

    private Long materialId;

    private String materialName;

    private String materialSpec;

    private String materialUnit;

    private BigDecimal requiredQuantity;

    private BigDecimal actualQuantity;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;

    private BigDecimal lossQuantity;

    private BigDecimal lossRate;

    private LocalDateTime createTime;
}
