package com.naturaldye.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkOrderMaterialVO {

    private Long id;

    private Long workOrderId;

    private Long inventoryId;

    private String materialName;

    private String batchNo;

    private BigDecimal quantity;

    private BigDecimal unitPrice;

    private BigDecimal totalPrice;

    private Integer status;

    private String remarks;
}
