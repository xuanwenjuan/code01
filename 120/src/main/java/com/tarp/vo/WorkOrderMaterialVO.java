package com.tarp.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class WorkOrderMaterialVO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long workOrderId;
    private Long materialId;
    private String materialName;
    private BigDecimal usageQuantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private LocalDateTime createTime;
}
