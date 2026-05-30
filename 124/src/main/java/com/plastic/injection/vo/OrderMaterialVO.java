package com.plastic.injection.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderMaterialVO {

    private Long id;

    private Long orderId;

    private Long materialId;

    private String materialName;

    private String materialCode;

    private String batchNo;

    private BigDecimal planQuantity;

    private BigDecimal actualQuantity;

    private BigDecimal unitPrice;

    private BigDecimal totalCost;

    private String unit;

    private Integer isLocked;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
