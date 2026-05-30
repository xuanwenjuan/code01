package com.oiledumbrella.entity;

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
    private Long materialId;
    private Long batchId;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private Long operatorId;
    private Integer lockStatus;
    private LocalDateTime lockTime;
    private Integer isScrap;
    private String scrapReason;
}
