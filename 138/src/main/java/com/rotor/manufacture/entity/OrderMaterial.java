package com.rotor.manufacture.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("order_material")
public class OrderMaterial extends BaseEntity {
    private Long orderId;
    private String orderNo;
    private Long materialId;
    private String materialName;
    private String materialCode;
    private String materialType;
    private String batchNo;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private Integer operationType;
    private Long operatorId;
    private String operatorName;
    private LocalDateTime operationTime;
    private String remark;
}